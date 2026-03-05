### DOT Example

Код DOT
```
digraph G {
  rankdir=TB;
  node [fontname="Arial", fontsize=11];
  edge [color="slategray"];

  Ульянов_Владимир_Ильич [shape=box, style="filled", fillcolor="lightsteelblue", color="darkslategray",
    label="Ленин\nУльянов\nВладимир\nИльич\n1870–1924", image="https://bpmbpm.github.io/family-tree/ver2/pic/Ульянов_Владимир_Ильич.png",
    fixedsize=true, width=1.1, height=1.9, fontsize=9.9,
    imagepos=tc, imagescale=false, labelloc=b];
  Ульянов_Илья_Николаевич [shape=box, style="filled", fillcolor="lightsteelblue", color="darkslategray",
    label="Ульянов\nИлья\nНиколаевич\n1831–1886", image="https://bpmbpm.github.io/family-tree/ver2/pic/Ульянов_Илья_Николаевич.png",
    fixedsize=true, width=1.1, height=1.9,
    imagepos=tc, imagescale=false, labelloc=b];
  Бланк_Мария_Александровна [shape=box, style="filled", fillcolor="lightpink", color="darkslategray",
    label="Ульянова\nБланк\nМария\nАлександровна\n1835–1916", image="https://bpmbpm.github.io/family-tree/ver2/pic/Бланк_Мария_Александровна.png",
    fixedsize=true, width=1.1, height=1.9, fontsize=9.9,
    imagepos=tc, imagescale=false, labelloc=b];
  Ульянин_Николай_Васильевич [shape=box, style="filled", fillcolor="lightsteelblue", color="darkslategray",
    label="Ульянин\nНиколай\nВасильевич\n1768–1836", image="https://bpmbpm.github.io/family-tree/ver2/pic/dafaultm.png",
    fixedsize=true, width=1.1, height=1.9,
    imagepos=tc, imagescale=false, labelloc=b];
  Смирнова_Анна_Алексеевна [shape=box, style="filled", fillcolor="lightpink", color="darkslategray",
    label="Смирнова\nАнна\nАлексеевна\n1788–1871", image="https://bpmbpm.github.io/family-tree/ver2/pic/dafaultf.png",
    fixedsize=true, width=1.1, height=1.9,
    imagepos=tc, imagescale=false, labelloc=b];

  subgraph cluster_marriage_0 {
    label="25.08 (6.09) 1863";
    rank=same;
    style=dashed;
    color="slategray";
    Ульянов_Илья_Николаевич;
    Бланк_Мария_Александровна;
  }

  Ульянов_Илья_Николаевич -> Ульянов_Владимир_Ильич;
  Бланк_Мария_Александровна -> Ульянов_Владимир_Ильич;
  Ульянин_Николай_Васильевич -> Ульянов_Илья_Николаевич;
  Смирнова_Анна_Алексеевна -> Ульянов_Илья_Николаевич;
}
```
no image. см. https://github.com/bpmbpm/family-tree/blob/main/design/problem.md#1-graphvizonlin-vs-foto
[dreampuf.github.io](https://dreampuf.github.io/GraphvizOnline/?engine=dot#digraph%20G%20%7B%0A%20%20rankdir%3DTB%3B%0A%20%20node%20%5Bfontname%3D%22Arial%22%2C%20fontsize%3D11%5D%3B%0A%20%20edge%20%5Bcolor%3D%22slategray%22%5D%3B%0A%0A%20%20%D0%A3%D0%BB%D1%8C%D1%8F%D0%BD%D0%BE%D0%B2_%D0%92%D0%BB%D0%B0%D0%B4%D0%B8%D0%BC%D0%B8%D1%80_%D0%98%D0%BB%D1%8C%D0%B8%D1%87%20%5Bshape%3Dbox%2C%20style%3D%22filled%22%2C%20fillcolor%3D%22lightsteelblue%22%2C%20color%3D%22darkslategray%22%2C%0A%20%20%20%20label%3D%22%D0%9B%D0%B5%D0%BD%D0%B8%D0%BD%5Cn%D0%A3%D0%BB%D1%8C%D1%8F%D0%BD%D0%BE%D0%B2%5Cn%D0%92%D0%BB%D0%B0%D0%B4%D0%B8%D0%BC%D0%B8%D1%80%5Cn%D0%98%D0%BB%D1%8C%D0%B8%D1%87%5Cn1870%E2%80%931924%22%2C%20image%3D%22https%3A%2F%2Fbpmbpm.github.io%2Ffamily-tree%2Fver2%2Fpic%2F%D0%A3%D0%BB%D1%8C%D1%8F%D0%BD%D0%BE%D0%B2_%D0%92%D0%BB%D0%B0%D0%B4%D0%B8%D0%BC%D0%B8%D1%80_%D0%98%D0%BB%D1%8C%D0%B8%D1%87.png%22%2C%0A%20%20%20%20fixedsize%3Dtrue%2C%20width%3D1.1%2C%20height%3D1.9%2C%20fontsize%3D9.9%2C%0A%20%20%20%20imagepos%3Dtc%2C%20imagescale%3Dfalse%2C%20labelloc%3Db%5D%3B%0A%20%20%D0%A3%D0%BB%D1%8C%D1%8F%D0%BD%D0%BE%D0%B2_%D0%98%D0%BB%D1%8C%D1%8F_%D0%9D%D0%B8%D0%BA%D0%BE%D0%BB%D0%B0%D0%B5%D0%B2%D0%B8%D1%87%20%5Bshape%3Dbox%2C%20style%3D%22filled%22%2C%20fillcolor%3D%22lightsteelblue%22%2C%20color%3D%22darkslategray%22%2C%0A%20%20%20%20label%3D%22%D0%A3%D0%BB%D1%8C%D1%8F%D0%BD%D0%BE%D0%B2%5Cn%D0%98%D0%BB%D1%8C%D1%8F%5Cn%D0%9D%D0%B8%D0%BA%D0%BE%D0%BB%D0%B0%D0%B5%D0%B2%D0%B8%D1%87%5Cn1831%E2%80%931886%22%2C%20image%3D%22https%3A%2F%2Fbpmbpm.github.io%2Ffamily-tree%2Fver2%2Fpic%2F%D0%A3%D0%BB%D1%8C%D1%8F%D0%BD%D0%BE%D0%B2_%D0%98%D0%BB%D1%8C%D1%8F_%D0%9D%D0%B8%D0%BA%D0%BE%D0%BB%D0%B0%D0%B5%D0%B2%D0%B8%D1%87.png%22%2C%0A%20%20%20%20fixedsize%3Dtrue%2C%20width%3D1.1%2C%20height%3D1.9%2C%0A%20%20%20%20imagepos%3Dtc%2C%20imagescale%3Dfalse%2C%20labelloc%3Db%5D%3B%0A%20%20%D0%91%D0%BB%D0%B0%D0%BD%D0%BA_%D0%9C%D0%B0%D1%80%D0%B8%D1%8F_%D0%90%D0%BB%D0%B5%D0%BA%D1%81%D0%B0%D0%BD%D0%B4%D1%80%D0%BE%D0%B2%D0%BD%D0%B0%20%5Bshape%3Dbox%2C%20style%3D%22filled%22%2C%20fillcolor%3D%22lightpink%22%2C%20color%3D%22darkslategray%22%2C%0A%20%20%20%20label%3D%22%D0%A3%D0%BB%D1%8C%D1%8F%D0%BD%D0%BE%D0%B2%D0%B0%5Cn%D0%91%D0%BB%D0%B0%D0%BD%D0%BA%5Cn%D0%9C%D0%B0%D1%80%D0%B8%D1%8F%5Cn%D0%90%D0%BB%D0%B5%D0%BA%D1%81%D0%B0%D0%BD%D0%B4%D1%80%D0%BE%D0%B2%D0%BD%D0%B0%5Cn1835%E2%80%931916%22%2C%20image%3D%22https%3A%2F%2Fbpmbpm.github.io%2Ffamily-tree%2Fver2%2Fpic%2F%D0%91%D0%BB%D0%B0%D0%BD%D0%BA_%D0%9C%D0%B0%D1%80%D0%B8%D1%8F_%D0%90%D0%BB%D0%B5%D0%BA%D1%81%D0%B0%D0%BD%D0%B4%D1%80%D0%BE%D0%B2%D0%BD%D0%B0.png%22%2C%0A%20%20%20%20fixedsize%3Dtrue%2C%20width%3D1.1%2C%20height%3D1.9%2C%20fontsize%3D9.9%2C%0A%20%20%20%20imagepos%3Dtc%2C%20imagescale%3Dfalse%2C%20labelloc%3Db%5D%3B%0A%20%20%D0%A3%D0%BB%D1%8C%D1%8F%D0%BD%D0%B8%D0%BD_%D0%9D%D0%B8%D0%BA%D0%BE%D0%BB%D0%B0%D0%B9_%D0%92%D0%B0%D1%81%D0%B8%D0%BB%D1%8C%D0%B5%D0%B2%D0%B8%D1%87%20%5Bshape%3Dbox%2C%20style%3D%22filled%22%2C%20fillcolor%3D%22lightsteelblue%22%2C%20color%3D%22darkslategray%22%2C%0A%20%20%20%20label%3D%22%D0%A3%D0%BB%D1%8C%D1%8F%D0%BD%D0%B8%D0%BD%5Cn%D0%9D%D0%B8%D0%BA%D0%BE%D0%BB%D0%B0%D0%B9%5Cn%D0%92%D0%B0%D1%81%D0%B8%D0%BB%D1%8C%D0%B5%D0%B2%D0%B8%D1%87%5Cn1768%E2%80%931836%22%2C%20image%3D%22https%3A%2F%2Fbpmbpm.github.io%2Ffamily-tree%2Fver2%2Fpic%2Fdafaultm.png%22%2C%0A%20%20%20%20fixedsize%3Dtrue%2C%20width%3D1.1%2C%20height%3D1.9%2C%0A%20%20%20%20imagepos%3Dtc%2C%20imagescale%3Dfalse%2C%20labelloc%3Db%5D%3B%0A%20%20%D0%A1%D0%BC%D0%B8%D1%80%D0%BD%D0%BE%D0%B2%D0%B0_%D0%90%D0%BD%D0%BD%D0%B0_%D0%90%D0%BB%D0%B5%D0%BA%D1%81%D0%B5%D0%B5%D0%B2%D0%BD%D0%B0%20%5Bshape%3Dbox%2C%20style%3D%22filled%22%2C%20fillcolor%3D%22lightpink%22%2C%20color%3D%22darkslategray%22%2C%0A%20%20%20%20label%3D%22%D0%A1%D0%BC%D0%B8%D1%80%D0%BD%D0%BE%D0%B2%D0%B0%5Cn%D0%90%D0%BD%D0%BD%D0%B0%5Cn%D0%90%D0%BB%D0%B5%D0%BA%D1%81%D0%B5%D0%B5%D0%B2%D0%BD%D0%B0%5Cn1788%E2%80%931871%22%2C%20image%3D%22https%3A%2F%2Fbpmbpm.github.io%2Ffamily-tree%2Fver2%2Fpic%2Fdafaultf.png%22%2C%0A%20%20%20%20fixedsize%3Dtrue%2C%20width%3D1.1%2C%20height%3D1.9%2C%0A%20%20%20%20imagepos%3Dtc%2C%20imagescale%3Dfalse%2C%20labelloc%3Db%5D%3B%0A%0A%20%20subgraph%20cluster_marriage_0%20%7B%0A%20%20%20%20label%3D%2225.08%20(6.09)%201863%22%3B%0A%20%20%20%20rank%3Dsame%3B%0A%20%20%20%20style%3Ddashed%3B%0A%20%20%20%20color%3D%22slategray%22%3B%0A%20%20%20%20%D0%A3%D0%BB%D1%8C%D1%8F%D0%BD%D0%BE%D0%B2_%D0%98%D0%BB%D1%8C%D1%8F_%D0%9D%D0%B8%D0%BA%D0%BE%D0%BB%D0%B0%D0%B5%D0%B2%D0%B8%D1%87%3B%0A%20%20%20%20%D0%91%D0%BB%D0%B0%D0%BD%D0%BA_%D0%9C%D0%B0%D1%80%D0%B8%D1%8F_%D0%90%D0%BB%D0%B5%D0%BA%D1%81%D0%B0%D0%BD%D0%B4%D1%80%D0%BE%D0%B2%D0%BD%D0%B0%3B%0A%20%20%7D%0A%0A%20%20%D0%A3%D0%BB%D1%8C%D1%8F%D0%BD%D0%BE%D0%B2_%D0%98%D0%BB%D1%8C%D1%8F_%D0%9D%D0%B8%D0%BA%D0%BE%D0%BB%D0%B0%D0%B5%D0%B2%D0%B8%D1%87%20-%3E%20%D0%A3%D0%BB%D1%8C%D1%8F%D0%BD%D0%BE%D0%B2_%D0%92%D0%BB%D0%B0%D0%B4%D0%B8%D0%BC%D0%B8%D1%80_%D0%98%D0%BB%D1%8C%D0%B8%D1%87%3B%0A%20%20%D0%91%D0%BB%D0%B0%D0%BD%D0%BA_%D0%9C%D0%B0%D1%80%D0%B8%D1%8F_%D0%90%D0%BB%D0%B5%D0%BA%D1%81%D0%B0%D0%BD%D0%B4%D1%80%D0%BE%D0%B2%D0%BD%D0%B0%20-%3E%20%D0%A3%D0%BB%D1%8C%D1%8F%D0%BD%D0%BE%D0%B2_%D0%92%D0%BB%D0%B0%D0%B4%D0%B8%D0%BC%D0%B8%D1%80_%D0%98%D0%BB%D1%8C%D0%B8%D1%87%3B%0A%20%20%D0%A3%D0%BB%D1%8C%D1%8F%D0%BD%D0%B8%D0%BD_%D0%9D%D0%B8%D0%BA%D0%BE%D0%BB%D0%B0%D0%B9_%D0%92%D0%B0%D1%81%D0%B8%D0%BB%D1%8C%D0%B5%D0%B2%D0%B8%D1%87%20-%3E%20%D0%A3%D0%BB%D1%8C%D1%8F%D0%BD%D0%BE%D0%B2_%D0%98%D0%BB%D1%8C%D1%8F_%D0%9D%D0%B8%D0%BA%D0%BE%D0%BB%D0%B0%D0%B5%D0%B2%D0%B8%D1%87%3B%0A%20%20%D0%A1%D0%BC%D0%B8%D1%80%D0%BD%D0%BE%D0%B2%D0%B0_%D0%90%D0%BD%D0%BD%D0%B0_%D0%90%D0%BB%D0%B5%D0%BA%D1%81%D0%B5%D0%B5%D0%B2%D0%BD%D0%B0%20-%3E%20%D0%A3%D0%BB%D1%8C%D1%8F%D0%BD%D0%BE%D0%B2_%D0%98%D0%BB%D1%8C%D1%8F_%D0%9D%D0%B8%D0%BA%D0%BE%D0%BB%D0%B0%D0%B5%D0%B2%D0%B8%D1%87%3B%0A%7D
) 
