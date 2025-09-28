# Railroad-диаграммы

https://github.com/tabatkins/railroad-diagrams

::: preview Посмотреть код

```railroad
Diagram(
  Sequence(
    Terminal("SELECT"),
    Optional(Choice(0, Terminal("ALL"), Terminal("DISTINCT"))),
    Choice(0,
      Terminal("*"),
      OneOrMore(NonTerminal("select_item"), Terminal(","))
    ),
    Optional(
      Sequence(
        Terminal("FROM"),
        OneOrMore(NonTerminal("table_ref"), Terminal(","))
      )
    ),
    Optional(Sequence(Terminal("WHERE"), NonTerminal("condition"))),
    Optional(
      Sequence(
        Terminal("GROUP BY"),
        OneOrMore(NonTerminal("expr"), Terminal(","))
      )
    ),
    Optional(Sequence(Terminal("HAVING"), NonTerminal("condition"))),
    Optional(
      Sequence(
        Terminal("ORDER BY"),
        OneOrMore(NonTerminal("order_item"), Terminal(","))
      )
    ),
    Optional(Sequence(Terminal("LIMIT"), NonTerminal("count"))),
    Optional(Sequence(Terminal("OFFSET"), NonTerminal("start")))
  )
)
```

:::
