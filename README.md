# Random Wheel

一个完全离线的本地随机转盘网页，使用原生 HTML、CSS 和 JavaScript 实现。

## 功能介绍
- 支持无限数量的转盘
- 支持新增、删除、重命名、切换转盘
- 使用 Canvas 绘制高清转盘
- 支持开始抽取、淘汰结果、恢复全部选项
- 保存每次抽取历史记录
- 支持导入导出 JSON 数据
- 所有数据保存在浏览器的 localStorage 中

## 使用方法
1. 双击 index.html 即可在浏览器中打开。
2. 在编辑区输入每行一个选项。
3. 点击开始进行抽取。
4. 抽中结果后可选择保留或淘汰。

## 项目结构
- index.html：页面结构
- style.css：界面样式
- script.js：应用逻辑与交互
- wheel.js：Canvas 转盘绘制
- animation.js：转盘动画逻辑
- storage.js：本地存储与 JSON 导入导出
- README.md：项目说明

## 数据保存方式
- 所有转盘数据、历史记录和当前选择会自动保存到浏览器的 localStorage。
- 关闭网页后重新打开，数据仍然保留。

## 导入导出说明
- 点击导出可下载 random-wheel.json 文件。
- 点击导入可恢复之前导出的 JSON 数据。
