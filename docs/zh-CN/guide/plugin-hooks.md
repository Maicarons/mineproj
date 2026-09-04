# 插件生命周期钩子

## config:resolved (waterfall)
配置解析后调用，可修改配置。

## data:loaded (seq)
数据加载后调用，可访问数据集。

## data:validated (seq)
数据验证后调用，用于自定义验证。

## assets:process (seq)
资源处理前调用。

## routes:collect (waterfall)
路由收集时调用，可添加/修改路由。

## api:endpoints (waterfall)
API 端点生成前调用，可添加自定义端点。

## render:before (waterfall)
每个页面渲染前调用，可修改 HTML。

## emit (seq)
用于写入额外文件。

## build:done (seq)
构建完成后调用。