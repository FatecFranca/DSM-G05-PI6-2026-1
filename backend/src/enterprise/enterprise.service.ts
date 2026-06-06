import { Injectable } from '@nestjs/common';

@Injectable()
export class EnterpriseService {
  private readonly enterprises = [
    {
      id: 1,
      enterprise_name: "EletroMundo Varejo",
      cnpj: "12.345.678/0001-99",
      address: "Rua das Flores, 123 - Centro, São Paulo - SP",
      cep: "01234-567",
      email: "contato@eletromundo.com.br",
      phone: "(11) 98765-4321 / (11) 3210-9876",
      type: ["Eletrônicos", "Eletrodomésticos"]
    },
    {
      id: 2,
      enterprise_name: "AgroSul Distribuidora",
      cnpj: "98.765.432/0001-11",
      address: "Av. dos Fazendeiros, 456 - Distrito Industrial, Ribeirão Preto - SP",
      cep: "14000-000",
      email: "vendas@agrosul.com.br",
      phone: "(16) 3456-7890",
      type: ["Soja", "Milho"]
    },
    {
      id: 3,
      enterprise_name: "TechMiner Corp",
      cnpj: "45.123.890/0001-55",
      address: "Rodovia MG-10, Km 20 - Vetor Norte, Belo Horizonte - MG",
      cep: "31000-000",
      email: "suporte@techminer.com",
      phone: "(31) 3333-4444",
      type: ["Minério de Ferro", "Nióbio", "Ouro"]
    },
    {
      id: 4,
      enterprise_name: "Global Alimentos",
      cnpj: "56.789.012/0001-33",
      address: "Rua do Comércio, 89 - Zona Portuária, Santos - SP",
      cep: "11010-100",
      email: "logistica@globalalimentos.com.br",
      phone: "(13) 3222-1111",
      type: ["Soja", "Café", "Açúcar"]
    }
  ];

  findAll() {
    return this.enterprises;
  }
}
