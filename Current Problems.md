## Dataview Inline Field Syntax Rendering Issue

- GitHub: [Inline fields do not render correctly in Live Preview mode. · Issue #1979 · blacksmithgu/obsidian-dataview](https://github.com/blacksmithgu/obsidian-dataview/issues/1979) 

The workaround is to add another space (two or more) between fields.

To find potential places where an inline field would not render, use the following regex:

```
ag -u '(?<!- \[.|\])\] \[(?!\[)'
```

---
