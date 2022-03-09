# seolint

检验关键字出现次数

## 使用方法

在`package.json`中配置
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "seolint": {
    "/Fist/templates/User/View/active_list.html": {
      "二维码": 2
    },
    "/Fist/templates/User/View/active_list_new.html": {
      "二维码": 3
    }
  },
  "lint-staged": {
    "./Fist/**/*.{html,tpl}": "seolint"
  }
}
```
