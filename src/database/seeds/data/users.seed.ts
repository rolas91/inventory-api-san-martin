import * as bcrypt from 'bcrypt';

export async function getUsersSeedData() {
  const hash = (plain: string) => bcrypt.hash(plain, 10);

  return [
    {
      codigoUser: 'admin',
      nombre: 'Administrador',
      password: await hash('admin1234'),
      role: 'admin',
      isActive: true,
    },
    {
      codigoUser: 'operator01',
      nombre: 'Operador Planta 1',
      password: await hash('oper1234'),
      role: 'operario',
      isActive: true,
    },
    {
      codigoUser: 'operator02',
      nombre: 'Operador Planta 2',
      password: await hash('oper1234'),
      role: 'operario',
      isActive: true,
    },
  ];
}
