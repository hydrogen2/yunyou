# Render log — Day 1 · London — the departure — linear cut (review animatic)

**Rendered:** 2026-09-03T09:10:41.206Z   **Tool:** studio/tools/render/render_linear.mjs   **Wall clock:** 9.1 min

**Output:** `products/around-the-world-80-days/day-01-london/linear/day-01-london_zh.mp4` — 1126.0 s (18:46), 1920×1080 h264 25/1 fps, aac 48000 Hz 2 ch, 231.6 MB, faststart. Subtitles: `day-01-london_zh.vtt` (burned in AND sidecar).

**Language:** Mandarin (zh-Hans) — text from `i18n/zh-Hans.json`, index-addressed, English where the locale is silent. **Voice:** local Kokoro zf_xiaoxiao @ 1x via ~/hilbert (Apache-2.0, free, no account). **Narration gain:** -0.9 dB (measured). **Beds:** Commons audio at -35 LUFS (≈ 18 dB under narration), stings at -26 LUFS. **Slack:** a scene may exceed its README seconds by 10 % before the script is end-cut at a sentence boundary. **Scene length:** clamp(narration + pad, README seconds, README seconds x 1.10) — the authored seconds are a floor as well as a cap, so silence the rundown asked for actually exists ("air" column below).

Locale: /home/supper-user/yunyou/products/around-the-world-80-days/day-01-london/i18n/zh-Hans.json (简体中文) — 18 scenes translated; anything missing falls back to English.
Selection: 17 scenes from scenes/README.md "Linear cut" table (1077 s planned).
Narration level: measured -16.1 LUFS over 12 clip(s) → -0.9 dB to reach -17 LUFS.
Sidecar cut hints: studio/tools/render/cuts/day-01-london.json.

## Rights compliance
- YouTube: not downloaded, not re-encoded. no clip cards in this cut; 5 shot(s) come from self-hosted, licence-clean files under `media/files/` (Wikimedia Commons / public-domain film / KartaView), never from youtube.com.
- Street View: not screen-recorded — stop cards only.
- Commons images resolved through the API (imageinfo, width 1920), attribution burned bottom-right while shown and repeated on the credits card. Freesound refs (login-gated) skipped.

## Scenes

| # | scene | type | at | s (README) | TTS | air | visual source | beds | script cuts |
|---|-------|------|----|-----------:|-----|----:|---------------|------|-------------|
| 01 | cold-open | interstitial | 0:04 | 60.0 (60) | ok 36.2 s | 20.8 s | scene title card 4.0 s<br>player screenshot showRouteMap(true) 56.0 s | M-40 0:00–0:04 (sting -15 dB → -26 LUFS)<br>M-41 0:04–1:00 (bed -8 dB → -35 LUFS) | — |
| 02 | savile-row | video | 1:04 | 84.0 (84) | ok 58.4 s | 24.6 s | M-66 local footage media/files/m66-savile-row-hyperlapse.mp4 — self-hosted, licence-clean 8.0 s<br>M-77a Commons still 1920x1440 → backdrop 32.0 s<br>M-77c Commons still 960x540 → backdrop 16.0 s<br>M-77b Commons still 1920x1188 → fill 28.0 s | — | sidecar: dropped [14] 这是1890年前后的这条街。<br>sidecar: dropped [15] 同样的门，同样的安静。 |
| 03 | fogg-by-the-clock | card | 2:28 | 50.0 (50) | ok 32.9 s | 16.1 s | player screenshot showScene(2) 50.0 s | — | sidecar: dropped [1] 点任意一行，看那一刻发生什么。 |
| 04 | count-the-steps | video | 3:18 | 97.0 (97) | ok 58.2 s | 37.8 s | M-30 Commons still 1920x1428 → backdrop 46.0 s<br>panowalk — mapillary Sx3G6T8ksr5enAm47adDbE (stops 5), cached frames, same move as the player 14.0 s<br>panowalk — mapillary JhVerKzIuOMLq1PbWpil4Z (stops 6), cached frames, same move as the player 20.0 s<br>M-106 Commons still 800x600 → backdrop 8.0 s<br>M-69a Commons still 640x501 → plate (credit printed on the mount) 9.0 s | — | — |
| 05 | the-reform-club | photo | 4:55 | 62.0 (62) | ok 37.2 s | 23.8 s | M-105 Commons still 1920x1440 → backdrop 8.8 s<br>M-97 Commons still 1698x1792 → backdrop 9.8 s<br>M-96 still 2170x3380 → backdrop 6.2 s<br>M-95 Commons still 1920x1056 → fill 7.1 s<br>M-94 Commons still 729x545 → plate (credit printed on the mount) 5.3 s<br>M-22 Commons still 709x431 → plate (credit printed on the mount) 4.4 s<br>M-23 Commons still 632x521 → plate (credit printed on the mount) 20.4 s | M-43 0:00–1:02 (bed -14 dB → -35 LUFS) | sidecar: dropped [6] 厨房也有名，是跟名厨阿历克西·索耶一起规划的。 |
| 06 | quiz-verne-saloon | quiz | 5:57 | 50.0 (50) | ok 24.3 s | 24.7 s | quiz screen (own render) 50.0 s | M-43 0:00–0:50 (bed -14 dB → -35 LUFS) | sidecar: dropped [7] 慢慢想，这里的茶很有名。 |
| 07 | the-wager | photo | 6:47 | 75.0 (75) | ok 41.7 s | 32.3 s | M-35 Commons still 1920x2776 → backdrop 25.0 s<br>player screenshot showScene(6).then(()=>seek(35)) 50.0 s | M-41 0:00–1:15 (bed -8 dB → -35 LUFS) | — |
| 09 | the-world-shrinks | map | 8:02 | 92.0 (92) | ok 48.8 s | 42.2 s | player screenshot showRouteMap(false) 83.0 s<br>player screenshot showRouteMap(true) 9.0 s | M-41 0:00–1:32 (bed -8 dB → -35 LUFS) | sidecar: dropped [18] 现在，在地图上点出最长的一段。 |
| 10 | pack-the-bag | game | 9:34 | 88.0 (88) | ok 48.0 s | 39.0 s | checklist screen (own render) 88.0 s | M-42 0:59–1:28 (bed -14 dB → -35 LUFS) | sidecar: dropped [10] 该带的拖进去，该留的留下。 |
| 11 | the-dash | map | 11:02 | 58.0 (58) | ok 38.0 s | 19.0 s | M-30 Commons still 1920x1428 → backdrop 40.0 s<br>M-29 Commons still 1920x1367 → backdrop 10.0 s<br>M-30 Commons still 1920x1428 → backdrop 8.0 s | M-42 0:00–0:58 (bed -14 dB → -35 LUFS) | — |
| 12 | charing-cross | video | 12:00 | 75.0 (75) | ok 43.3 s | 29.7 s | M-84 local footage media/files/m84-trafalgar-square.mp4 — self-hosted, licence-clean 16.0 s<br>M-81 local footage media/files/m81-trafalgar-1890-disc.mp4 — self-hosted, licence-clean 8.0 s<br>M-78 local footage media/files/m78-strand-1903.mp4 — self-hosted, licence-clean 16.0 s<br>M-74 Commons still 1920x2939 → backdrop 12.0 s<br>M-51 Commons still 1920x2827 → backdrop 23.0 s | — | — |
| 13 | then-and-now | photo | 13:15 | 26.0 (26) | ok 12.9 s | 12.1 s | M-24 Commons still 1802x1345 → backdrop 13.0 s<br>M-26 Commons still 1920x3272 → backdrop 13.0 s | — | sidecar: dropped [0] 拖动这条缝。<br>sidecar: dropped [4] 你今天仍然可以在这里买去多佛的票。<br>sidecar: dropped [5] 去巴黎的快车改从圣潘克拉斯站发。 |
| 14 | look-up-the-cross | streetview | 13:41 | 50.0 (50) | ok 32.3 s | 16.7 s | panowalk — mapillary ctrzEaPC8S2q1DQvsiupmL (stops 0), cached frames, same move as the player 50.0 s | — | — |
| 15 | quiz-the-weather | quiz | 14:31 | 28.0 (28) | ok 12.6 s | 14.4 s | quiz screen (own render) 28.0 s | M-44 0:00–0:28 (bed -22 dB → -35 LUFS) | — |
| 16 | passepartout-on-the-platform | dialogue | 14:59 | 46.0 (46) | ok 29.0 s | 16.0 s | dialogue screen (own render, scripted chips) 46.0 s | M-44 0:00–0:46 (bed -22 dB → -35 LUFS) | sidecar: dropped [2] 问他点什么吧。 |
| 17 | the-boat-train | video | 15:45 | 82.0 (82) | ok 52.7 s | 28.3 s | M-27 Commons still 1526x986 → backdrop 10.0 s<br>M-88 local footage media/files/m88-hungerford-bridge-night.mp4 — self-hosted, licence-clean 12.0 s<br>M-76 Commons still 1920x1440 → backdrop 36.0 s<br>M-27 Commons still 1526x986 → backdrop 24.0 s | M-44 0:00–0:10 (bed -22 dB → -35 LUFS)<br>M-45 0:13–0:17 (sting -9 dB → -26 LUFS) | — |
| 18 | souvenir | card | 17:07 | 54.0 (54) | ok 33.0 s | 20.0 s | player screenshot showScene(18) 54.0 s | M-41 0:00–0:54 (bed -8 dB → -35 LUFS) | sidecar: dropped [8] 下一站：多佛、加来、巴黎。 |

Title card 4 s at 0:00; credits 3 page(s) at the end. Total 18:46.

## Warnings
- 2 savile-row: zh: sentence tokens re-aligned proportionally — English kept 16/19 → Mandarin 14/16 (no zh cut sheet; see README "Two cuts")
- 3 fogg-by-the-clock: zh: sentence tokens re-aligned proportionally — English kept 11/13 → Mandarin 12/13 (no zh cut sheet; see README "Two cuts")
- 5 the-reform-club: zh: sentence tokens re-aligned proportionally — English kept 10/11 → Mandarin 10/11 (no zh cut sheet; see README "Two cuts")
- 6 quiz-verne-saloon: zh: sentence tokens re-aligned proportionally — English kept 7/8 → Mandarin 7/8 (no zh cut sheet; see README "Two cuts")
- 9 the-world-shrinks: zh: sentence tokens re-aligned proportionally — English kept 18/19 → Mandarin 18/19 (no zh cut sheet; see README "Two cuts")
- 10 pack-the-bag: zh: sentence tokens re-aligned proportionally — English kept 18/19 → Mandarin 18/19 (no zh cut sheet; see README "Two cuts")
- 11 the-dash: zh: sentence tokens re-aligned proportionally — English kept 10/10 → Mandarin 9/9 (no zh cut sheet; see README "Two cuts")
- 13 then-and-now: zh: sentence tokens re-aligned proportionally — English kept 4/7 → Mandarin 4/7 (no zh cut sheet; see README "Two cuts")
- 15 quiz-the-weather: zh: sentence tokens re-aligned proportionally — English kept 2/2 → Mandarin 2/2 (no zh cut sheet; see README "Two cuts")
- 16 passepartout-on-the-platform: zh: sentence tokens re-aligned proportionally — English kept 2/3 → Mandarin 2/3 (no zh cut sheet; see README "Two cuts")
- 18 souvenir: zh: sentence tokens re-aligned proportionally — English kept 7/9 → Mandarin 8/9 (no zh cut sheet; see README "Two cuts")
- 04_count-the-steps: M-106 is only 800x600 — shown at its own pixels on a blurred backdrop, never enlarged
- 05_the-reform-club: M-96 could not be fetched (HTTP 504 https://iiif.archive.org/image/iiif/3/18361886reformcl00fagauoft%2f1836) — used media[].fallback
- 11_the-dash: audio M-46 (https://freesound.org/people/Sirderf/sounds/333680/) is not on Commons — skipped (login/download needed).
- 11_the-dash: audio M-47 (https://freesound.org/people/Owl/sounds/191741/) is not on Commons — skipped (login/download needed).
- 15_quiz-the-weather: audio M-58 (https://freesound.org/people/delfieldrecordings/sounds/842069/) is not on Commons — skipped (login/download needed).
- 16_passepartout-on-the-platform: audio M-58 (https://freesound.org/people/delfieldrecordings/sounds/842069/) is not on Commons — skipped (login/download needed).

## Sentence index per scene (for the sidecar / Narrator)

**01 cold-open** — [0] 1872年，法国作家儒勒·凡尔纳出了一本小说：《八十天环游地球》。 [1] 主角菲利亚斯·福克，伦敦绅士，照着钟表过日子。 [2] 他赌上一半身家，说自己能用八十天绕地球一圈。 [3] 今晚——10月2日，星期三——8点45分，他的火车离开伦敦。 [4] 我们从今天起跟着他走。 [5] 看地图：现在只有伦敦亮着，往后一天点亮一处。 [6] 还有一个名字：路路通，福克今早刚雇的法国仆人。 [7] 他的表慢四分钟。 [8] 记住这块表。 [9] 第一站，福克家门口那条街：萨维尔街。

**02 savile-row** — [0] 这就是萨维尔街，梅费尔的一条安静小街。 [1] 小说从这里开头。 [2] 菲利亚斯·福克住在这条街上——书里写的是7号。 [3] 今晚他就从那扇门出发，绕地球一圈。 [4] 看橱窗里：成卷的呢料、粉线记号、做了一半的上衣。 [5] 1872年这里已经是裁缝街，今天还是。 [6] 亨利·普尔的店1846年把正门开在这条街上，如今还在，1982年起搬到15号。 [7] 店里自己的说法是，1865年他们给威尔士亲王做过一件短的晚礼服上衣，也就是后来晚礼服的祖宗。 [8] 再看一处：3号的屋顶，1969年1月，披头士在那儿唱了那场著名的屋顶演唱会。 [9] 还有7号的一点小秘密。 [10] 凡尔纳写，剧作家谢里丹1814年死在那里。 [11] 其实谢里丹住14号，1816年去世； [12] 14号墙上有他的纪念牌。 [13] 福克没有牌子——他只活在书里。 [14] 这是1890年前后的这条街。 [15] 同样的门，同样的安静。

**03 fogg-by-the-clock** — [0] 福克的一天，按钟走。 [1] 点任意一行，看那一刻发生什么。 [2] 8点起床。 [3] 8点23分，茶和吐司。 [4] 9点37分，刮胡子的热水，正好30摄氏度。 [5] 11点半出门，午夜到家。 [6] 今天上午11点29分，路路通走进这栋房子。 [7] 巴黎人，三十岁上下。 [8] 当过流浪歌手、马戏骑手、体操教师、巴黎消防员。 [9] 五年里换过十户英国人家。 [10] 他现在只想过安稳日子。 [11] 看看他的脸。 [12] 我们已经喜欢上他了——那个表慢四分钟的人。

**04 count-the-steps** — [0] 11点半，福克出门，走着去俱乐部，一路数脚步：一千一百五十一步。 [1] 路线在字幕上，六条街，最后往东一拐，就是蓓尔美尔街。 [2] 从他家门到俱乐部门，1,120米，差不多一公里； [3] 也就是说，他每一步97厘米。 [4] 他一次也没有快过。 [5] 这就是他要走进去的那条街。 [6] 1807年，蓓尔美尔街装上煤气灯，是伦敦最早的几条之一——比福克早六十五年，这里的灯就已经是未来。 [7] 这里是俱乐部区，南边一排全是私人俱乐部，其中三家挨在一起。 [8] 正前方那座石头门脸、高窗户的，是104号，改良俱乐部，查尔斯·巴里设计，1841年开门。 [9] 那家是福克的。 [10] 往左一点，106号，旅行者俱乐部，巴里的第一座意大利式府邸，1832年完工。 [11] 再过去107号，雅典娜俱乐部。 [12] 一转头，三家都在。

**05 the-reform-club** — [0] 这就是福克那家俱乐部的大门：改良俱乐部。 [1] 它是真的，今天还在——蓓尔美尔街104号。 [2] 创办人当年支持1832年的改革法案，名字就是这么来的。 [3] 书里，福克每天泡在这儿到午夜：吃饭、看报、打牌。 [4] 建筑师查尔斯·巴里1841年建成这栋楼。 [5] 外面是石头，里面是这间大厅。 [6] 厨房也有名，是跟名厨阿历克西·索耶一起规划的。 [7] 厨房在地下室。 [8] 福克的早餐就在这里吃：烤鱼配雷丁酱——记住这个酱。 [9] 然后是巴里设计的正面立面图。 [10] 就在那里面，福克裁开报纸的毛边，读他的《泰晤士报》。

**06 quiz-verne-saloon** — [0] 凡尔纳把俱乐部内部写得很细。 [1] 马赛克地面。 [2] 一圈回廊，穹顶下二十根红石柱撑着。 [3] 蓝色的彩绘玻璃窗。 [4] 餐厅有九扇窗，朝着花园。 [5] 拿这些去对巴里真造的房子。 [6] 哪一处是真的？ [7] 慢慢想，这里的茶很有名。

**07 the-wager** — [0] 傍晚，俱乐部里。 [1] 福克坐下来打惠斯特牌，同桌五位会员——四人一局，每晚都是这五个。 [2] 故事里——只在故事里——有个贼从英格兰银行偷走了五万五千镑。 [3] 这种人如今还能躲到哪儿去？ [4] 《每日电讯报》顺势算了一笔账：绕地球一圈，八十天够了。 [5] 牌桌上，这笔账变成一场赌局。 [6] 工程师安德鲁·斯图尔特赌四千镑，说办不到。 [7] 福克押两万镑——一半身家——说办得到。 [8] 看卡片：六个名字，斯图尔特第一，福克最后。 [9] 他必须在12月21日星期六晚上8点45分回到这个房间。 [10] 福克的座右铭：“意外不存在。”

**09 the-world-shrinks** — [0] 这个计划怎么会有人信？ [1] 因为世界刚刚变小。 [2] 牌桌上有人说世界大得很，福克回了三个字：“从前是。” [3] 看这三处亮点。 [4] 苏伊士运河，1869年11月通航。 [5] 美国横贯大陆的铁路，1869年5月接轨。 [6] 印度最后一段铁路，1870年3月合龙。 [7] 三扇门，十个月里先后打开，就在今晚的两年前。 [8] 现在看这条线画出来。 [9] 伦敦到苏伊士，七天。 [10] 苏伊士到孟买，坐船，十三天。 [11] 孟买到加尔各答，火车，三天。 [12] 加尔各答到香港，十三天。 [13] 香港到横滨，六天。 [14] 横滨到旧金山，二十二天。 [15] 旧金山到纽约，火车，七天。 [16] 纽约回伦敦，九天。 [17] 加起来：八十天。 [18] 现在，在地图上点出最长的一段。

**10 pack-the-bag** — [0] 7点25分。 [1] 福克从俱乐部回到家，叫来路路通，说：“十分钟后我们动身去多佛和加来。” [2] 多佛在英国海边； [3] 加来在海峡对岸的法国。 [4] 去哪儿？ [5] “我们要绕地球一圈。” [6] “八十天。” [7] 别忘了，路路通想过的是安稳日子。 [8] 现在帮他收拾。 [9] 只有一只毡呢旅行包，所有东西都得装进去。 [10] 该带的拖进去，该留的留下。 [11] 每人两件衬衫、三双袜子。 [12] 一件橡胶雨衣，一件旅行斗篷。 [13] 红皮封面的《布拉德肖》——厚厚一本火车时刻表。 [14] 还有一卷英格兰银行的钞票：两万镑。 [15] 不带书——这屋里本来就没有。 [16] 电钟留在壁炉台上。 [17] 今晚留下的还有煤气——记住这一点。 [18] 两件衬衫，三双袜子，半个身家。

**11 the-dash** — [0] 福克和路路通在萨维尔街街口叫了辆马车——多半是汉森马车，两轮，一匹马，跑得快。 [1] 在车夫眼里，福克是个“阔少”。 [2] 车费每英里六便士，不足一英里也按一英里算； [3] 到查令十字大约一英里半，就算一先令。 [4] 看1872年地图上这条线，往南往东，到河岸街。 [5] 伦敦当时已经有地铁——九年新，蒸汽机车，一路是烟。 [6] 福克还是坐马车。 [7] 听：石板路上的马蹄，还有一段轻快的法国舞曲，给巴黎人路路通。 [8] 他们7点25分离开俱乐部，8点20分到查令十字。

**12 charing-cross** — [0] 这里是河岸街，前面就是查令十字车站。 [1] 别想“老伦敦”：对福克来说，这是新伦敦。 [2] 车站1864年1月开，那晚才八岁。 [3] 石十字碑和它背后的旅馆，1865年。 [4] 地铁九岁。 [5] 河边的泰晤士河堤两岁。 [6] 我们叫大本钟的钟楼十三岁。 [7] 今晚他路过的东西，很多比他的仆人还年轻。 [8] 有一样你在这儿看不见：车站那片铁屋顶，一跨155米。 [9] 它1905年塌了，后来重建——这句就说到这里。 [10] 然后是今晚唯一暖的一刻。 [11] 一个赤脚女人抱着孩子来讨钱。 [12] 福克把刚在牌桌上赢的二十几尼递过去。 [13] 脚步都没停。

**13 then-and-now** — [0] 拖动这条缝。 [1] 左边：1872年的版画——福克见到的旅馆和站前广场。 [2] 右边：今天的十字碑。 [3] 后面六个站台，去多佛还是大约每小时一班。 [4] 你今天仍然可以在这里买去多佛的票。 [5] 去巴黎的快车改从圣潘克拉斯站发。 [6] 旅馆还是旅馆，换了个名字。

**14 look-up-the-cross** — [0] 停在这儿。 [1] 找两样东西。 [2] 第一样在你正上方：顺着十字碑看到最顶——21米的石头。 [3] 它是复制品，1865年立的，正是它背后那家旅馆开业那年。 [4] 第二样难一点。 [5] 向右转出站前广场，朝特拉法加广场看，大约两百米。 [6] 你从这儿看不清他，但查理一世的骑马像就立在那边。 [7] 1291年的第一座十字碑就立在那个位置。 [8] 伦敦的里程至今从那座像算起，不是从你头顶这块石头。

**15 quiz-the-weather** — [0] 8点40分，还在站台顶棚底下。 [1] 抬头看——今晚天气怎么样？

**16 passepartout-on-the-platform** — [0] 8点40分，下着雨。 [1] 那个提包的就是路路通——他认识主人才九个小时。 [2] 问他点什么吧。

**17 the-boat-train** — [0] 这张明信片是1905年的，福克之后三十三年。 [1] 同样的站台——还有那片老屋顶，大概是它塌掉前的最后几个月。 [2] 去巴黎的接船列车正等着。 [3] 回到今晚。 [4] 8点40分，我们坐定。 [5] 8点45分，汽笛一响，车开了，过亨格福德桥——今天的火车还是这样离开福克的车站。 [6] 我们这段是白天拍的； [7] 福克遇上的是雨和黑夜。 [8] 往右看：河边的泰晤士河堤，1872年才两岁； [9] 再远一点那座钟楼，十三岁。 [10] 崭新的伦敦在他身后退去。 [11] 今天这趟车到多佛大约两小时。 [12] 福克的计划给了他七天到苏伊士，这是第一个小时。 [13] 开出几英里，路路通猛地坐直。 [14] 他忘了关房间里的煤气灯。 [15] 福克说：“烧着吧，算你的账。” [16] 未完待续。

**18 souvenir** — [0] 今天的纪念品：福克在伦敦的最后一顿早餐——他押上半个身家之前吃的那一顿。 [1] 主菜是烤鱼，配雷丁酱风味的酱汁。 [2] 雷丁酱是真有过的英国调味酱，1802年开始卖，1960年代消失。 [3] 菜谱在卡片上。 [4] 把卡片存下来。 [5] 12月21日晚上做这顿饭，8点45分之前坐到桌前。 [6] 福克答应回到那个房间的，正是那一刻。 [7] 他另一句座右铭，也送给我们上路：“用好最少的东西，什么都够了。” [8] 下一站：多佛、加来、巴黎。

## Digest
- Did: rendered 17 scenes + title + credits into one h264/aac MP4 (18:46) with Edge TTS narration, sentence captions, Commons beds and clip/stop cards where rights forbid copying.
- Weak: 0 clip card(s) still stand in and stop cards for 1 Street View scene(s) (388.0 s of 1126.0); 0 scene(s) were end-cut mechanically where TTS overran the README seconds (see table) — Narrator should re-trim by hand; generated assets (G-xx) are still pending cards.
- Next: swap clip cards for licensed footage once Rights clears direct licences; add per-sentence timed overlays; run loudnorm on the final mix; add a 9:16 variant.