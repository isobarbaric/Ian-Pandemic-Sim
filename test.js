
test = new Set()

test.add(((1, 2), 2))
test.add(((1, 2), 2))
test.add(((3, 5), 3))
test.add(((3, 5), 4))

console.log(test.size)