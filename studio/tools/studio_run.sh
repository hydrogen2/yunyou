#!/usr/bin/env bash
# Scheduled studio run: wakes Claude Code headless, does one production step, syncs git, keeps the server up.
# Cron calls this; the time-window guard below is authoritative (cron lines are only a coarse cadence).
set -u
REPO=/home/supper-user/yunyou
LOG_DIR=$REPO/studio/logs; mkdir -p "$LOG_DIR"
STAMP=$(date -u +%Y%m%d-%H%M); LOG=$LOG_DIR/run-$STAMP.log
LOCK=/tmp/yunyou-studio.lock
export PATH=/home/supper-user/.local/bin:/usr/local/bin:/usr/bin:/bin
export HOME=/home/supper-user
cd "$REPO" || exit 1

# ---- window guard: weekdays 11:00–23:59 UTC and 00:00–01:59 UTC; weekends all day (FORCE=1 overrides) ----
H=$(date -u +%H); DOW=$(date -u +%u)   # 1=Mon..7=Sun
in_window() { [ "${FORCE:-0}" = 1 ] && return 0; [ "$DOW" -ge 6 ] && return 0; [ "$H" -ge 11 ] && return 0; [ "$H" -lt 2 ] && return 0; return 1; }
if ! in_window; then echo "$(date -u +%FT%TZ) outside window (H=$H DOW=$DOW) — skip" >> "$LOG_DIR/cron.log"; exit 0; fi

# ---- keep the HTTPS server up (port 443 needs sudo -n) ----
if ! ss -tln 2>/dev/null | grep -q ':443 '; then
  (sudo -n nohup python3 "$REPO/studio/research/prototypes/window/serve.py" 443 "$REPO/www" >> "$REPO/www/serve.log" 2>&1 &) ; sleep 1
fi

# ---- single instance ----
exec 9>"$LOCK"; if ! flock -n 9; then echo "$(date -u +%FT%TZ) another run active — skip" >> "$LOG_DIR/cron.log"; exit 0; fi

echo "$(date -u +%FT%TZ) run start → $LOG" >> "$LOG_DIR/cron.log"
git pull -q --rebase origin main 2>>"$LOG" || true

PROMPT="Scheduled studio run $(date -u +%FT%TZ). Read studio/PRODUCTION.md and follow it exactly: one production step, journal entry, stop."
timeout 150m claude -p "$PROMPT" \
  --dangerously-skip-permissions \
  --max-turns 120 \
  --output-format text \
  >> "$LOG" 2>&1
RC=$?
echo "--- claude exit $RC at $(date -u +%FT%TZ)" >> "$LOG"
if grep -qiE "usage limit|session limit|rate limit|resets .* UTC" "$LOG"; then echo "$(date -u +%FT%TZ) quota/rate limit hit (rc=$RC) — will retry next tick" >> "$LOG_DIR/cron.log"; fi

# ---- sync ----
git add -A >/dev/null 2>&1
if ! git diff --cached --quiet; then
  git -c user.name="yunyou-studio" -c user.email="weizhiwei@gmail.com" commit -q -m "studio run $STAMP (rc=$RC)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>" && git push -q origin main >>"$LOG" 2>&1 || echo "$(date -u +%FT%TZ) git push failed" >> "$LOG_DIR/cron.log"
fi
echo "$(date -u +%FT%TZ) run end rc=$RC" >> "$LOG_DIR/cron.log"
# keep last 40 run logs
ls -1t "$LOG_DIR"/run-*.log 2>/dev/null | tail -n +41 | xargs -r rm -f
exit 0
