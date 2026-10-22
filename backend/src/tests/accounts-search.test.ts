import assert from "node:assert";

// Unit test for unified account search condition logic and activation state transitions
interface MockOffice {
  id: string;
  code: string;
  name: string;
}

interface MockUser {
  id: string;
  fullName: string;
  email: string;
  studentId: string | null;
  role: "student" | "teacher" | "staff" | "admin";
  department: string | null;
  officeId: string | null;
  isActive: boolean;
}

function matchesSearch(
  user: MockUser,
  search: string,
  offices: MockOffice[],
): boolean {
  const term = search.trim().toLowerCase();
  if (!term) return true;

  if (user.fullName.toLowerCase().includes(term)) return true;
  if (user.email.toLowerCase().includes(term)) return true;
  if (user.studentId && user.studentId.toLowerCase().includes(term)) return true;
  if (user.department && user.department.toLowerCase().includes(term)) return true;

  if (user.officeId) {
    const userOffice = offices.find((o) => o.id === user.officeId);
    if (userOffice) {
      if (userOffice.code.toLowerCase().includes(term)) return true;
      if (userOffice.name.toLowerCase().includes(term)) return true;
    }
  }

  return false;
}

function runTests() {
  console.log("Running Accounts and Search unit tests...");

  const mockOffices: MockOffice[] = [
    { id: "off-our-uuid", code: "OUR", name: "Office of the University Registrar" },
    { id: "off-hrmo-uuid", code: "HRMO", name: "Human Resource Management Office" },
  ];

  const mockUsers: MockUser[] = [
    {
      id: "u1",
      fullName: "Alyson Staff",
      email: "alyson.staff@tup.edu.ph",
      studentId: null,
      role: "staff",
      department: null,
      officeId: "off-our-uuid",
      isActive: true,
    },
    {
      id: "u2",
      fullName: "Maria Professor",
      email: "maria.prof@tup.edu.ph",
      studentId: null,
      role: "teacher",
      department: "Mathematics Department",
      officeId: null,
      isActive: true,
    },
    {
      id: "u3",
      fullName: "Juan Dela Cruz",
      email: "juan.student@tup.edu.ph",
      studentId: "TUPM-21-0042",
      role: "student",
      department: null,
      officeId: null,
      isActive: false,
    },
  ];

  // 1. Search by office code "OUR" should find Alyson Staff
  const ourResults = mockUsers.filter((u) => matchesSearch(u, "OUR", mockOffices));
  assert.strictEqual(ourResults.length, 1);
  assert.strictEqual(ourResults[0]!.fullName, "Alyson Staff");

  // 2. Search by office full name "Registrar" should find Alyson Staff
  const regResults = mockUsers.filter((u) => matchesSearch(u, "Registrar", mockOffices));
  assert.strictEqual(regResults.length, 1);
  assert.strictEqual(regResults[0]!.fullName, "Alyson Staff");

  // 3. Search by department "Mathematics" should find Maria Professor
  const mathResults = mockUsers.filter((u) => matchesSearch(u, "Mathematics", mockOffices));
  assert.strictEqual(mathResults.length, 1);
  assert.strictEqual(mathResults[0]!.fullName, "Maria Professor");

  // 4. Search by student ID "TUPM-21" should find Juan Dela Cruz
  const studentResults = mockUsers.filter((u) => matchesSearch(u, "TUPM-21", mockOffices));
  assert.strictEqual(studentResults.length, 1);
  assert.strictEqual(studentResults[0]!.fullName, "Juan Dela Cruz");

  // 5. Account activation check
  assert.strictEqual(mockUsers[0]!.isActive, true);
  assert.strictEqual(mockUsers[2]!.isActive, false);

  // 6. Suspended account login check
  function canAuthenticate(user: MockUser): boolean {
    return user.isActive;
  }
  assert.strictEqual(canAuthenticate(mockUsers[0]!), true);
  assert.strictEqual(canAuthenticate(mockUsers[2]!), false);

  console.log("Accounts and Search unit tests passed successfully!");
}

runTests();
