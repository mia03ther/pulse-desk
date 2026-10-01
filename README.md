# 快讯台

一个可放上 GitHub Pages 的复盘快讯台。结构参考公开资讯站的栏目：快讯、复盘、日历、公告、研报。内容、名字和版式是独立的，行情是演示数据，不是实时接口。

打开一条快讯可以看到影响、触发和失效，并能复制成社群帖。每日复盘会收成 5 条观察。

## 本地看

直接打开 `index.html`，或在这个目录运行：

```bash
python3 -m http.server 4173
```

## 部署到你的 GitHub

```bash
cd pulse-desk
git init
git add .
git commit -m "Add news desk"
gh repo create pulse-desk --public --source=. --remote=origin --push
```

仓库 Settings → Pages → Build and deployment 选 GitHub Actions。推送后工作流会发布，地址一般是：

`https://<用户名>.github.io/pulse-desk/`
