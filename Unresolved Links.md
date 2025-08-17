---
excludePeopleFromUnresolvedLinksList: true
---

```dataviewjs
const excludePeople = dv.current().excludePeopleFromUnresolvedLinksList;
const unresolvedLinks = new Map();
for(let p of dv.pages()) {
  for(let out of p.file.outlinks) {
    if(dv.page(out.path)) {
	    continue;
	}
	if(app.vault.getAbstractFileByPath(out.path)) {
		continue;
	}
	if(excludePeople && out.path.startsWith("👤 ")) {
		continue;
	}
	if(!unresolvedLinks.has(out.path)) {
		unresolvedLinks.set(out.path, []);
	}
	unresolvedLinks.get(out.path).push(p.file.link)
  }
}

dv.table(
	["Note", "Incoming Links", "First Link"], 
	Array.from(unresolvedLinks.entries()).sort().map(([k, v]) => [k, v.length, v[0]])
);
```
