import { StudentRepository } from "../repositories/student.repository";

export class StudentService {
  constructor(private readonly repo = new StudentRepository()) {}

  async list(
    academyId: string,
    filters: { search?: string; status?: string },
    pagination: { offset: number; limit: number }
  ) {
    return this.repo.listByAcademy(academyId, filters, pagination);
  }

  async create(academyId: string, payload: any) {
    return this.repo.create(academyId, payload);
  }
}

