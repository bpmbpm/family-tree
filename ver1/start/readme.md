### example
- параметр к mermaid.live/view#pako https://github.com/bpmbpm/Form072 ; https://github.com/bpmbpm/Form072
- \n https://github.com/mermaid-js/mermaid/issues/6436 нужно <br>

### mermaid
- https://habr.com/ru/articles/652867/
- Прямое встраивание внешних файлов изображений (JPG, PNG) внутрь диаграмм Mermaid по стандартному синтаксису невозможно, так как это инструмент для генерации диаграмм из текста. Однако, вы можете использовать иконки из библиотек (например, через EventCatalog) или вставлять Mermaid-код в Markdown-файлы, где картинки добавляются отдельно 
- [EPC](https://mermaid.live/edit#pako:eNqFVN1u0zAYfRXLkxBIaVdHTZtmaBcwuOOGTUKi7UWWOGu0NK6chK20nbZOIE1M9IYLrpDgCcpgYuynewX7jbDz27VD80XyffH5znd8bGcALWJjaEAAHI_sWR2ThmDrWcsHYgTR9g41ex2wR-iunAbNN2nUThBy2C7FVugSP6-T48U77IdoMGDf2Yz95J_4mF2wcwSebtN1EISizWgESqV18DLy42rUZN_YLTvnh2zKP7ILPkHtGBAzqYtMasLkuL4bdEajpDH27SRY0G8TK5G_kQQPqhe4qCsX0FxlX0TbS37Mrtk5u-FjtNpexqnLODXDLYgqVFHiYdB8LZ-PwBYh3oOyJBY9brKv_EhYNWNX7EYYNRYNr_gpaj8pkJv9IMRd1BRY9qMk4Bf8KAZesylqF43SINeYOXVwcFDsTDKVHwI5J7XPryo3DJTKpfUhO-MfhL7ffMJPxG79lbzJhrE_bMp-sZkQM2Nn7JJNh4uN8jTlktL_x3YrjoucORbWj4fFftzHBGKqzDg-EWdtLKgnw8TX-0v4EYgrroXkE37KPwOh4EaayQ-LzZarSC1PaCzPDIL0EijJCQZYvtbm53PXlFy4XFsc3QEWqpw0Wpt3PwZtYCdpIS6F5xkrjmOJoQQhJbvYWLFr2zWtlqalPdcOO4ba219bYMj4UxKMHA2jnKRqmY5WWSJR6L6hK7Rv6It02WpSOsu6o0nTtGVBUIE71LWhEdIIK7CLadeUKRxI7hYMO7iLW9AQoY0dM_LCFmz5I1HWM_23hHSzSkqinQ40HNMLRBb1bDPEG64pLl8OMaOQbPZ9K8ux7YaEvkp-ifGfUdCIy4HpcxL5ITS0uAs0BnAfGgg1yvU6alSRqmvVhlqpKbAvPlfUst6o1_Vara5Xaw1dHynwfSysUtbrWmVuoNE_vOMeeA)
### dot
- [viz-js.com](http://viz-js.com/#eNrtl81u2kAQx+99itHmSgvGfEXFlgC7YMkNkXGVqiiyDDbEKjHI6alVJXrqpVK/Ljm0h6ovgKIgEVL6DMsr9Ek6tiEUBEalwVElfNrZmd35W/7577VhNR29cwJFeHUPwNHt54blcGr+IUZ22zCh2mjbL2z91ORIzrH0FomAO3NmvTQ5Jn7s1plGE+vq7Vbb4che0kgZaZNgBlPa0guqZyd6x+Tstm1G4FR3mpbNxSLQ0mtmi8tm1VxeFiFfVgRR4UiMQEGU5WnI+GHlMFeQDoo36cOcIHhxgkC+WCjLZazd09l6osFixSSO11kzGSM8Slt+ZVVlddIvEEApH2H7A47ECRxJglrCrkkCJVEqllR//Eh6KgoV6ZnIEVV5IpLgTb2NpcdFqCgFjnSsepR+p9fjd+P3dER/0guNfqLXtEcv6YD+oINxV6Pnbh6Hbx907CaBSiEnT3ut0BRdc2NRVVh76/y8LljUBTNdwfthVvm3p8AzmXQMfnU/A7MfT2zaDTMubDzvkazteL0lXs/9UKNfEY0hzrmY9OnF3RM7UQbLlIXALMv4zGYyqa0yGya1jVptvx6bUaun2ESi9j9Q+9F7+iM61OgX2ht3EQJk9gPO9ulw/MbLXeI0koOjXsjk3qiDmTpYrS4MepMTx2W2Te/OdP/KdAd0NO+1V+6ZoYeQDLwP8l1bL+qbd9wrWKZv+winU5mJAbNbRnjnv+sB/uYfG/1vM+251jtyrexPD+57cITvvgvaYKoNlmkLAdzMFNw0cxvgBhx37/MrUsHnjc2WBawLXLjhsqB1UHV/ft339XjDzoubvP4ND+lIMw==)
- https://github.com/bpmbpm/rdf-grapher/tree/main/ver9d

### 2
нужно: 
Ульянов_Владимир_Ильич [shape=box, style="filled,rounded", fillcolor="#a3c4f3", color="#2c3e50", fontname="Arial", fontsize=12, label="Ульянов Владимир Ильич\n(1870–1924)"];

Пример встраивания фото:
```
digraph G {
    // Узел с изображением
    node1 [shape=none, label="", image="logo.png"];
    
    // Узел с текстом и изображением внутри
    node2 [shape=box, label="Сотрудник", image="photo.jpg", imagescale=true];
    
    node1 -> node2;
}
```
