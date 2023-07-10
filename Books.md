---
cssClass: cards, cards-2-3, cards-align-bottom
---

```dataview
TABLE WITHOUT ID
	("![](" + nonnull(book.editions.cover)[0] + ")") as Cover,
	link(file.path, book.title) as "Title",
	("By: " + join(book.authors, "; ")) as Authors,
	("Edition: " + nonnull(book.editions.label)[0]) as Edition,
	("Words: " + nonnull(book.editions.stats.words)[0]) as Words,
	("Pages: " + nonnull(book.editions.stats.pages)[0]) as Pages,
	("Started: " + started-reading) as Started
FROM "Catalog/Books"
SORT file.mtime DESC
WHERE book and started-reading and !finished-reading
```
```dataview
TABLE WITHOUT ID
	("![](" + nonnull(book.editions.cover)[0] + ")") as Cover,
	link(file.path, book.title) as "Title",
	("By: " + join(book.authors, "; ")) as Authors,
	("Edition: " + nonnull(book.editions.label)[0]) as Edition,
	("Words: " + nonnull(book.editions.stats.words)[0]) as Words,
	("Pages: " + nonnull(book.editions.stats.pages)[0]) as Pages
FROM "Catalog/Books"
SORT file.mtime DESC
WHERE book and !started-reading
```
```dataview
TABLE WITHOUT ID
	("![](" + nonnull(book.editions.cover)[0] + ")") as Cover,
	link(file.path, book.title) as "Title",
	("By: " + join(book.authors, "; ")) as Authors,
	("Edition: " + nonnull(book.editions.label)[0]) as Edition,
	("Words: " + nonnull(book.editions.stats.words)[0]) as Words,
	("Pages: " + nonnull(book.editions.stats.pages)[0]) as Pages,
	("Finished: " + finished-reading) as Finished
FROM "Catalog/Books"
SORT file.mtime DESC
WHERE book and finished-reading
```
---

- [ ] Format numbers in the Words column to have thousand separators.
- [ ] Align the Words column right.

| Title                                                                                        |   Words | Author                            |
| -------------------------------------------------------------------------------------------- | -------:| --------------------------------- |
| One Up on Wall Street_ How to Use What You Already Know to Make Money In                     | 100,879 | Peter Lynch                       |
| Refactoring_ Improving the Design of Existing Code                                           | 105,814 | Martin Fowler                     |
| OpenGL Programming Guide_ The Official Guide to Learning OpenGL, Version 4.3, Eighth Edition | 231,762 | Dave Shreiner                     |
| FreeBSD Handbook                                                                             | 266,618 | The FreeBSD Documentation Project |
| Thinking in Java                                                                             | 362,385 | Bruce Eckel                       |


---

Building A Book Library In Obsidian - YouTube
https://www.youtube.com/watch?v=7PFFJlyiv28

---
