"""Word timings for guide narration, so listen mode can highlight each word as it's spoken.

Transcribes each recorded clip once with faster-whisper (word timestamps), lines the
transcript up with the exact script text, and writes <guide>/audio/timings.json:
  { clip_key: [[start, end], ...one pair per whitespace-separated word...] }
Only clips without timings are processed. Usage: python tools/align-words.py starwell-cold-call
"""
import difflib, json, os, re, sys

def norm(w):
    return re.sub(r"[^a-z0-9]", "", w.lower())

def align(words, heard, duration):
    """words: script words. heard: [(word, start, end)] from whisper. Returns [[s,e]] per script word."""
    a = [norm(w) for w in words]
    b = [norm(h[0]) for h in heard]
    out = [None] * len(words)
    for blk in difflib.SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks():
        for i in range(blk.size):
            if a[blk.a + i]:
                out[blk.a + i] = [heard[blk.b + i][1], heard[blk.b + i][2]]
    # Fill gaps (numbers spoken as digits, mishearings) by spreading time over the gap by word length.
    i = 0
    while i < len(words):
        if out[i] is not None:
            i += 1; continue
        j = i
        while j < len(words) and out[j] is None:
            j += 1
        t0 = out[i - 1][1] if i > 0 else (heard[0][1] if heard else 0.0)
        t1 = out[j][0] if j < len(words) else (heard[-1][2] if heard else duration)
        if t1 < t0: t1 = t0
        lens = [len(w) + 1 for w in words[i:j]]
        tot = float(sum(lens)); acc = 0
        for k in range(i, j):
            s = t0 + (t1 - t0) * acc / tot
            acc += lens[k - i]
            out[k] = [s, t0 + (t1 - t0) * acc / tot]
        i = j
    # Keep starts non-decreasing.
    for k in range(1, len(out)):
        if out[k][0] < out[k - 1][0]: out[k][0] = out[k - 1][0]
        if out[k][1] < out[k][0]: out[k][1] = out[k][0]
    return [[round(s, 2), round(e, 2)] for s, e in out]

def main():
    guide = sys.argv[1] if len(sys.argv) > 1 else "starwell-cold-call"
    adir = os.path.join(guide, "audio")
    man = json.load(open(os.path.join(adir, "manifest.json")))
    texts = man.get("texts") or {}
    tpath = os.path.join(adir, "timings.json")
    timings = json.load(open(tpath)) if os.path.exists(tpath) else {}
    todo = [k for k in man["files"] if k not in timings and k in texts and os.path.exists(os.path.join(adir, k + ".mp3"))]
    print(f"{len(todo)} clips need word timings")
    if todo:
        from faster_whisper import WhisperModel
        model = WhisperModel(os.environ.get("WHISPER_MODEL", "base.en"), device="cpu", compute_type="int8")
        for n, k in enumerate(todo, 1):
            segs, info = model.transcribe(os.path.join(adir, k + ".mp3"), word_timestamps=True, beam_size=1, language="en", vad_filter=False)
            heard = [(w.word.strip(), w.start, w.end) for s in segs for w in (s.words or [])]
            timings[k] = align(texts[k].split(), heard, info.duration)
            print(f"{n}/{len(todo)} {k}: {len(heard)} heard / {len(timings[k])} words")
            if n % 20 == 0:
                json.dump(timings, open(tpath, "w"))
    timings = {k: v for k, v in timings.items() if k in man["files"]}
    json.dump(timings, open(tpath, "w"))
    print("timings.json written")

if __name__ == "__main__":
    main()
