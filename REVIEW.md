修复历史路线切换时地图尺寸变化、图谱初始档案区内容不足、知识竞答成绩未同步及手机端成绩隐藏的问题；在原有风格与结构上补充预览、真实关系路径和错题回顾。

## 根本原因与修复

1. **地图尺寸变化**：Grid 默认拉伸，`.journey-map` 只有 `min-height`，不同详情高度会撑大整行；原SVG还设置了 `preserveAspectRatio="none"`。现使用独立比例与顶部对齐，地理底图保持比例、时间路线独立绘制。`chapterPanel()` / `refreshJourney()` 只更新详情、节点和连线状态，保留地图DOM。1440px实测旧版九站高度约625.56–648.36px，修复后均691.75px。
2. **图谱初始空白**：原欢迎区只有简短说明和按钮。`graphWelcome()` 改为主题介绍、五项实际数据统计、湘江人物推荐和简短探索流程；选择后进入档案，返回全图恢复导览。
3. **竞答成绩不同步**：`quizResult()` 原先保存最高分后只更新弹窗，没有刷新底层页面，且没有保存本轮成绩。新增 `recordQuiz()` / `lastQuiz`，明确区分本轮与最高分，`syncQuizScores()` 只更新页面成绩卡，不替换弹窗；行囊共用成绩展示。最高分仅取最大值，零分与未挑战分别显示。
4. **手机成绩不可见**：移除小屏隐藏成绩区的行为，改成两列紧凑成绩卡；装饰层不拦截触屏操作。

## P1增强

- 地图悬停/键盘预览，已浏览与挑战完成分开，既有时间轴定位，选中前的路线高亮和轻量详情淡入。
- `relationPath()` 仅沿真实有向关系生成探索路径，排除时间先后关系；连线与当前节点高亮，可点击路径回溯。发现提示附史料，不授予挑战或认证。
- 人物故事关闭后保留图谱状态，故事中的“返回关联事件”回到正确站点；“半条被子”保持独立归属。
- 本轮错题回顾包含用户答案、正确答案、解释与来源；题目进度使用中文。7道有明确事件的题目使用 `chapterId` 跳转图谱，泛化精神题不猜测关联地点。

## 修改文件

仅修改6个现有文件：`dist/app.js`、`dist/style.css`、`dist/data.js`、`dist/core.js`、`tests/core.test.cjs`、`README.md`。未新增项目源文件、依赖或部署配置。

存档键名和版本保持；旧最高分、次数、集章、收藏、已读、行动、手记、通信印记均保留。旧存档的未知本轮成绩显示为无记录；错题答案仅保留在当前页面会话，刷新后保留汇总成绩。自由练习、通信印记和九站集章仍分别处理。

## 验证

- 三个JS文件语法检查通过；`node --test tests/core.test.cjs`：16/16通过。
- Chromium实际验证1920、1440、1024、768、375px：九站连续切换地图尺寸和相对节点位置不变，地图DOM保留，无页面横向溢出。
- 多轮成绩83→100→33，本轮更新、最高分100不回退；弹窗关闭后、行囊与刷新后保持一致。
- 手机触屏完整完成6题得100分；旧存档保存、自由排序练习不影响成绩和集章。
- 图谱导览、路径与史料、故事返回、无错误的汝城关联、错题回顾、题目到图谱、前进后退、键盘及减少动态效果通过。
- 原有通信专题的全部接力操作、独立印记、设备/人物/档案互跳、手机与旧存档回归通过。
- 九站原有挑战全部实际完成；集章、学习记录导出和PNG纪念卡下载通过。无页面脚本错误。

## 截图

截图存于Fork的独立 `review/ui-interaction-polish` 评审素材分支，不加入本功能分支或main。

| 界面 | 修改前 | 修改后 |
| --- | --- | --- |
| 历史路线（桌面） | ![地图修改前](https://raw.githubusercontent.com/SAZxinyu/star-journey/review/ui-interaction-polish/map-before-desktop.png) | ![地图修改后](https://raw.githubusercontent.com/SAZxinyu/star-journey/review/ui-interaction-polish/map-after-desktop.png) |
| 图谱导览（桌面） | ![导览修改前](https://raw.githubusercontent.com/SAZxinyu/star-journey/review/ui-interaction-polish/guide-before-desktop.png) | ![导览修改后](https://raw.githubusercontent.com/SAZxinyu/star-journey/review/ui-interaction-polish/guide-after-desktop.png) |
| 成绩展示（手机） | ![成绩修改前](https://raw.githubusercontent.com/SAZxinyu/star-journey/review/ui-interaction-polish/scores-before-mobile.png) | ![手机100分实测](https://raw.githubusercontent.com/SAZxinyu/star-journey/review/ui-interaction-polish/scores-result-mobile.png) |

![真实路径高亮](https://raw.githubusercontent.com/SAZxinyu/star-journey/review/ui-interaction-polish/path-after-desktop.png)
![错题回顾](https://raw.githubusercontent.com/SAZxinyu/star-journey/review/ui-interaction-polish/review-after-desktop.png)
![手机图谱导览](https://raw.githubusercontent.com/SAZxinyu/star-journey/review/ui-interaction-polish/guide-after-mobile.png)

## 可选功能范围

P0与P1已完成。P2持久探索轨迹、行囊发现卡、青春回应PNG卡、历史与现实对照未实施；现有发现提示仅用于当次探索。原有红色电波专题保留，不另建重复玩法。

请按正常流程审核本PR；本次不直接合并或发布正式站点。
