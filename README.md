# Liquid transpiler

## transformation

- true
  - true
- (t, t)
  - [t, t]
- t.1
  - t[0]
- t.2
  - t[1]
- fun id: T = t
  - (id) => t
- t t
  - t(t)
- let id = t1 in t2
  - { const id = t1; t2; }
- not t
  - not(t)
- and t
  - and(t)
