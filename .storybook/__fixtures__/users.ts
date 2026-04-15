export interface User {
  id: string
  name: string
  email: string
  role: string
  age: number
  department: string
}

const usersData: User[] = [
  { id: "u1", name: "Alice Chen", email: "alice.chen@example.com", role: "Data Scientist", age: 31, department: "Analytics" },
  { id: "u2", name: "Bob Martinez", email: "bob.martinez@example.com", role: "DevOps Engineer", age: 28, department: "Infrastructure" },
  { id: "u3", name: "Clara Johansson", email: "clara.j@example.com", role: "Product Manager", age: 35, department: "Product" },
  { id: "u4", name: "David Kim", email: "david.kim@example.com", role: "Software Engineer", age: 26, department: "Engineering" },
  { id: "u5", name: "Eva Rossi", email: "eva.rossi@example.com", role: "QA Lead", age: 33, department: "Quality" },
  { id: "u6", name: "Frank Okafor", email: "frank.o@example.com", role: "Security Analyst", age: 29, department: "Security" },
]

export default usersData
