import { greeting } from '../../src/index'

test('greeting function prints input', () => {
    expect(greeting("World")).toBe("Hello, World!")
})
