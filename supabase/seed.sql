-- =============================================================================
-- SEED DE DEMONSTRAÇÃO — gerado por scripts/db/generate-seed.ts
-- Marcas, produtos e banners são FICTÍCIOS. Não use em produção como dados reais.
-- Para regenerar: pnpm db:seed:generate
-- =============================================================================

insert into public.categories (id, parent_id, name, slug, description, image_url, banner_url, icon, is_featured, sort_order) values
  ('c0000000-0000-4000-8000-000000000001', null, 'Materiais Básicos', 'materiais-basicos', 'Cimento, argamassa, blocos, tijolos e impermeabilizantes para a estrutura da obra.', 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=2000&q=80', 'brick-wall', true, 0),
  ('c0000000-0000-4000-8000-000000000005', null, 'Pisos e Revestimentos', 'pisos-e-revestimentos', 'Porcelanatos, cerâmicas e rejuntes para todos os ambientes.', 'https://images.unsplash.com/photo-1600328604921-300918f36018?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1600328604921-300918f36018?auto=format&fit=crop&w=2000&q=80', 'grid-3x3', true, 4),
  ('c0000000-0000-4000-8000-000000000009', null, 'Tintas', 'tintas', 'Tintas, vernizes e acessórios de pintura.', 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=2000&q=80', 'paint-roller', true, 8),
  ('c0000000-0000-4000-8000-00000000000c', null, 'Elétrica', 'eletrica', 'Fios, cabos, tomadas, interruptores e iluminação.', 'https://images.unsplash.com/photo-1601462904263-f2fa0c851cb9?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1601462904263-f2fa0c851cb9?auto=format&fit=crop&w=2000&q=80', 'plug-zap', true, 11),
  ('c0000000-0000-4000-8000-000000000010', null, 'Hidráulica', 'hidraulica', 'Tubos, conexões, registros e caixas d''água.', 'https://images.unsplash.com/photo-1646009445351-b8192e095f3a?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1646009445351-b8192e095f3a?auto=format&fit=crop&w=2000&q=80', 'droplets', true, 15),
  ('c0000000-0000-4000-8000-000000000013', null, 'Ferramentas', 'ferramentas', 'Ferramentas elétricas e manuais para obra e manutenção.', 'https://images.unsplash.com/photo-1426927308491-6380b6a9936f?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1426927308491-6380b6a9936f?auto=format&fit=crop&w=2000&q=80', 'hammer', true, 18),
  ('c0000000-0000-4000-8000-000000000016', null, 'Banheiro', 'banheiro', 'Louças, metais, chuveiros e acessórios para banheiro.', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=2000&q=80', 'bath', true, 21),
  ('c0000000-0000-4000-8000-00000000001a', null, 'Cozinha', 'cozinha', 'Cubas, torneiras e acessórios para cozinha.', 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=2000&q=80', 'chef-hat', true, 25),
  ('c0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000001', 'Cimentos e Argamassas', 'cimentos-e-argamassas', 'Cimentos, argamassas colantes e de assentamento.', 'https://images.unsplash.com/photo-1533378890784-b2a5b0a59d40?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1533378890784-b2a5b0a59d40?auto=format&fit=crop&w=2000&q=80', null, false, 1),
  ('c0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000001', 'Tijolos e Blocos', 'tijolos-e-blocos', 'Tijolos cerâmicos, blocos de concreto e blocos estruturais.', 'https://images.unsplash.com/photo-1495578942200-c5f5d2137def?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1495578942200-c5f5d2137def?auto=format&fit=crop&w=2000&q=80', null, false, 2),
  ('c0000000-0000-4000-8000-000000000004', 'c0000000-0000-4000-8000-000000000001', 'Impermeabilizantes', 'impermeabilizantes', 'Mantas, aditivos e argamassas poliméricas.', 'https://images.unsplash.com/photo-1487088678257-3a541e6e3922?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1487088678257-3a541e6e3922?auto=format&fit=crop&w=2000&q=80', null, false, 3),
  ('c0000000-0000-4000-8000-000000000006', 'c0000000-0000-4000-8000-000000000005', 'Porcelanatos', 'porcelanatos', 'Porcelanatos polidos, acetinados e técnicos em grandes formatos.', 'https://images.unsplash.com/photo-1706629503571-c165023a7792?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1706629503571-c165023a7792?auto=format&fit=crop&w=2000&q=80', null, false, 5),
  ('c0000000-0000-4000-8000-000000000007', 'c0000000-0000-4000-8000-000000000005', 'Cerâmicas', 'ceramicas', 'Pisos e revestimentos cerâmicos para paredes e áreas internas.', 'https://images.unsplash.com/photo-1523350165414-082d792c4bcc?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1523350165414-082d792c4bcc?auto=format&fit=crop&w=2000&q=80', null, false, 6),
  ('c0000000-0000-4000-8000-000000000008', 'c0000000-0000-4000-8000-000000000005', 'Rejuntes', 'rejuntes', 'Rejuntes cimentícios, acrílicos e epóxi.', 'https://images.unsplash.com/photo-1584354273341-3eb96574e5be?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1584354273341-3eb96574e5be?auto=format&fit=crop&w=2000&q=80', null, false, 7),
  ('c0000000-0000-4000-8000-00000000000a', 'c0000000-0000-4000-8000-000000000009', 'Tintas para Parede', 'tintas-para-parede', 'Tintas acrílicas e látex para paredes internas e externas.', 'https://images.unsplash.com/photo-1456086272160-b28b0645b729?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1456086272160-b28b0645b729?auto=format&fit=crop&w=2000&q=80', null, false, 9),
  ('c0000000-0000-4000-8000-00000000000b', 'c0000000-0000-4000-8000-000000000009', 'Acessórios de Pintura', 'acessorios-de-pintura', 'Rolos, pincéis, bandejas e fitas.', 'https://images.unsplash.com/photo-1525909002-1b05e0c869d8?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1525909002-1b05e0c869d8?auto=format&fit=crop&w=2000&q=80', null, false, 10),
  ('c0000000-0000-4000-8000-00000000000d', 'c0000000-0000-4000-8000-00000000000c', 'Fios e Cabos', 'fios-e-cabos', 'Cabos flexíveis e rígidos para instalações residenciais.', 'https://images.unsplash.com/photo-1601462904263-f2fa0c851cb9?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1601462904263-f2fa0c851cb9?auto=format&fit=crop&w=2000&q=80', null, false, 12),
  ('c0000000-0000-4000-8000-00000000000e', 'c0000000-0000-4000-8000-00000000000c', 'Tomadas e Interruptores', 'tomadas-e-interruptores', 'Módulos, placas e conjuntos montados.', 'https://images.unsplash.com/photo-1612257911111-074bd8388f88?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1612257911111-074bd8388f88?auto=format&fit=crop&w=2000&q=80', null, false, 13),
  ('c0000000-0000-4000-8000-00000000000f', 'c0000000-0000-4000-8000-00000000000c', 'Iluminação', 'iluminacao', 'Pendentes, lâmpadas LED e luminárias.', 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=2000&q=80', null, false, 14),
  ('c0000000-0000-4000-8000-000000000011', 'c0000000-0000-4000-8000-000000000010', 'Tubos e Conexões', 'tubos-e-conexoes', 'Tubos e conexões de PVC soldável e roscável.', 'https://images.unsplash.com/photo-1545193329-4a052e14eb8f?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1545193329-4a052e14eb8f?auto=format&fit=crop&w=2000&q=80', null, false, 16),
  ('c0000000-0000-4000-8000-000000000012', 'c0000000-0000-4000-8000-000000000010', 'Registros', 'registros', 'Registros de gaveta e de pressão.', 'https://images.unsplash.com/photo-1619365566184-272a34acfeb9?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1619365566184-272a34acfeb9?auto=format&fit=crop&w=2000&q=80', null, false, 17),
  ('c0000000-0000-4000-8000-000000000014', 'c0000000-0000-4000-8000-000000000013', 'Ferramentas Elétricas', 'ferramentas-eletricas', 'Furadeiras, parafusadeiras, serras e esmerilhadeiras.', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=2000&q=80', null, false, 19),
  ('c0000000-0000-4000-8000-000000000015', 'c0000000-0000-4000-8000-000000000013', 'Ferramentas Manuais', 'ferramentas-manuais', 'Martelos, chaves, trenas, colheres de pedreiro e níveis.', 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=2000&q=80', null, false, 20),
  ('c0000000-0000-4000-8000-000000000017', 'c0000000-0000-4000-8000-000000000016', 'Louças Sanitárias', 'loucas-sanitarias', 'Bacias, cubas e lavatórios.', 'https://images.unsplash.com/photo-1629079447777-1e605162dc8d?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1629079447777-1e605162dc8d?auto=format&fit=crop&w=2000&q=80', null, false, 22),
  ('c0000000-0000-4000-8000-000000000018', 'c0000000-0000-4000-8000-000000000016', 'Metais para Banheiro', 'metais-para-banheiro', 'Torneiras, misturadores e acabamentos de registro.', 'https://images.unsplash.com/photo-1600488999585-e4364713b90a?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1600488999585-e4364713b90a?auto=format&fit=crop&w=2000&q=80', null, false, 23),
  ('c0000000-0000-4000-8000-000000000019', 'c0000000-0000-4000-8000-000000000016', 'Chuveiros', 'chuveiros', 'Chuveiros elétricos e duchas.', 'https://images.unsplash.com/photo-1651951646668-46562cfb4518?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1651951646668-46562cfb4518?auto=format&fit=crop&w=2000&q=80', null, false, 24),
  ('c0000000-0000-4000-8000-00000000001b', 'c0000000-0000-4000-8000-00000000001a', 'Cubas e Pias', 'cubas-e-pias', 'Cubas de inox, pias e tanques.', 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=2000&q=80', null, false, 26),
  ('c0000000-0000-4000-8000-00000000001c', 'c0000000-0000-4000-8000-00000000001a', 'Torneiras de Cozinha', 'torneiras-de-cozinha', 'Torneiras de mesa, de parede e gourmet.', 'https://images.unsplash.com/photo-1610278764397-388d11c35ddb?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1610278764397-388d11c35ddb?auto=format&fit=crop&w=2000&q=80', null, false, 27);


insert into public.brands (id, name, slug, description, is_featured, sort_order) values
  ('b0000000-0000-4000-8000-000000000001', 'Monteval Cerâmica', 'monteval-ceramica', 'Marca fictícia criada para demonstrar o catálogo. Substitua pelas marcas reais no painel.', true, 0),
  ('b0000000-0000-4000-8000-000000000002', 'Cromalis Tintas', 'cromalis-tintas', 'Marca fictícia criada para demonstrar o catálogo. Substitua pelas marcas reais no painel.', true, 1),
  ('b0000000-0000-4000-8000-000000000003', 'Ferrobase', 'ferrobase', 'Marca fictícia criada para demonstrar o catálogo. Substitua pelas marcas reais no painel.', true, 2),
  ('b0000000-0000-4000-8000-000000000004', 'Aquavia Metais', 'aquavia-metais', 'Marca fictícia criada para demonstrar o catálogo. Substitua pelas marcas reais no painel.', true, 3),
  ('b0000000-0000-4000-8000-000000000005', 'Lumitra', 'lumitra', 'Marca fictícia criada para demonstrar o catálogo. Substitua pelas marcas reais no painel.', true, 4),
  ('b0000000-0000-4000-8000-000000000006', 'Solidar Cimentos', 'solidar-cimentos', 'Marca fictícia criada para demonstrar o catálogo. Substitua pelas marcas reais no painel.', true, 5),
  ('b0000000-0000-4000-8000-000000000007', 'Pedra Alta Louças', 'pedra-alta-loucas', 'Marca fictícia criada para demonstrar o catálogo. Substitua pelas marcas reais no painel.', true, 6),
  ('b0000000-0000-4000-8000-000000000008', 'Condutta Cabos', 'condutta-cabos', 'Marca fictícia criada para demonstrar o catálogo. Substitua pelas marcas reais no painel.', false, 7);


insert into public.attributes (id, name, slug, unit, group_name, is_filterable, sort_order) values
  ('a7700000-0000-4000-8000-000000000001', 'Formato', 'formato', 'cm', 'Dimensões', true, 0),
  ('a7700000-0000-4000-8000-000000000002', 'Acabamento', 'acabamento', null, 'Especificações', true, 1),
  ('a7700000-0000-4000-8000-000000000003', 'Cor', 'cor', null, 'Especificações', true, 2),
  ('a7700000-0000-4000-8000-000000000004', 'Espessura', 'espessura', 'mm', 'Dimensões', false, 3),
  ('a7700000-0000-4000-8000-000000000005', 'Área por caixa', 'area-por-caixa', 'm²', 'Embalagem', false, 4),
  ('a7700000-0000-4000-8000-000000000006', 'Aplicação', 'aplicacao', null, 'Especificações', true, 5),
  ('a7700000-0000-4000-8000-000000000007', 'Tipo', 'tipo', null, 'Especificações', true, 6),
  ('a7700000-0000-4000-8000-000000000008', 'Embalagem', 'embalagem', null, 'Embalagem', true, 7),
  ('a7700000-0000-4000-8000-000000000009', 'Volume', 'volume', null, 'Embalagem', true, 8),
  ('a7700000-0000-4000-8000-00000000000a', 'Rendimento', 'rendimento', null, 'Desempenho', false, 9),
  ('a7700000-0000-4000-8000-00000000000b', 'Material', 'material', null, 'Especificações', true, 10),
  ('a7700000-0000-4000-8000-00000000000c', 'Bitola', 'bitola', 'mm²', 'Especificações', true, 11),
  ('a7700000-0000-4000-8000-00000000000d', 'Comprimento', 'comprimento', null, 'Dimensões', false, 12),
  ('a7700000-0000-4000-8000-00000000000e', 'Corrente', 'corrente', 'A', 'Especificações', true, 13),
  ('a7700000-0000-4000-8000-00000000000f', 'Potência', 'potencia', 'W', 'Desempenho', false, 14),
  ('a7700000-0000-4000-8000-000000000010', 'Voltagem', 'voltagem', null, 'Especificações', true, 15),
  ('a7700000-0000-4000-8000-000000000011', 'Cor da luz', 'cor-da-luz', null, 'Especificações', true, 16),
  ('a7700000-0000-4000-8000-000000000012', 'Diâmetro', 'diametro', null, 'Dimensões', true, 17),
  ('a7700000-0000-4000-8000-000000000013', 'Rotação', 'rotacao', 'rpm', 'Desempenho', false, 18);


insert into public.category_attributes (category_id, attribute_id, sort_order) values
  ('c0000000-0000-4000-8000-000000000002', 'a7700000-0000-4000-8000-000000000007', 0),
  ('c0000000-0000-4000-8000-000000000002', 'a7700000-0000-4000-8000-000000000008', 1),
  ('c0000000-0000-4000-8000-000000000002', 'a7700000-0000-4000-8000-000000000006', 2),
  ('c0000000-0000-4000-8000-000000000003', 'a7700000-0000-4000-8000-000000000001', 0),
  ('c0000000-0000-4000-8000-000000000003', 'a7700000-0000-4000-8000-00000000000b', 1),
  ('c0000000-0000-4000-8000-000000000004', 'a7700000-0000-4000-8000-000000000007', 0),
  ('c0000000-0000-4000-8000-000000000004', 'a7700000-0000-4000-8000-000000000008', 1),
  ('c0000000-0000-4000-8000-000000000004', 'a7700000-0000-4000-8000-000000000006', 2),
  ('c0000000-0000-4000-8000-000000000006', 'a7700000-0000-4000-8000-000000000001', 0),
  ('c0000000-0000-4000-8000-000000000006', 'a7700000-0000-4000-8000-000000000002', 1),
  ('c0000000-0000-4000-8000-000000000006', 'a7700000-0000-4000-8000-000000000003', 2),
  ('c0000000-0000-4000-8000-000000000006', 'a7700000-0000-4000-8000-000000000004', 3),
  ('c0000000-0000-4000-8000-000000000006', 'a7700000-0000-4000-8000-000000000005', 4),
  ('c0000000-0000-4000-8000-000000000006', 'a7700000-0000-4000-8000-000000000006', 5),
  ('c0000000-0000-4000-8000-000000000007', 'a7700000-0000-4000-8000-000000000001', 0),
  ('c0000000-0000-4000-8000-000000000007', 'a7700000-0000-4000-8000-000000000002', 1),
  ('c0000000-0000-4000-8000-000000000007', 'a7700000-0000-4000-8000-000000000003', 2),
  ('c0000000-0000-4000-8000-000000000007', 'a7700000-0000-4000-8000-000000000005', 3),
  ('c0000000-0000-4000-8000-000000000007', 'a7700000-0000-4000-8000-000000000006', 4),
  ('c0000000-0000-4000-8000-000000000008', 'a7700000-0000-4000-8000-000000000003', 0),
  ('c0000000-0000-4000-8000-000000000008', 'a7700000-0000-4000-8000-000000000007', 1),
  ('c0000000-0000-4000-8000-000000000008', 'a7700000-0000-4000-8000-000000000008', 2),
  ('c0000000-0000-4000-8000-00000000000a', 'a7700000-0000-4000-8000-000000000002', 0),
  ('c0000000-0000-4000-8000-00000000000a', 'a7700000-0000-4000-8000-000000000009', 1),
  ('c0000000-0000-4000-8000-00000000000a', 'a7700000-0000-4000-8000-00000000000a', 2),
  ('c0000000-0000-4000-8000-00000000000a', 'a7700000-0000-4000-8000-000000000006', 3),
  ('c0000000-0000-4000-8000-00000000000a', 'a7700000-0000-4000-8000-000000000003', 4),
  ('c0000000-0000-4000-8000-00000000000b', 'a7700000-0000-4000-8000-00000000000b', 0),
  ('c0000000-0000-4000-8000-00000000000d', 'a7700000-0000-4000-8000-00000000000c', 0),
  ('c0000000-0000-4000-8000-00000000000d', 'a7700000-0000-4000-8000-00000000000d', 1),
  ('c0000000-0000-4000-8000-00000000000d', 'a7700000-0000-4000-8000-000000000003', 2),
  ('c0000000-0000-4000-8000-00000000000e', 'a7700000-0000-4000-8000-000000000003', 0),
  ('c0000000-0000-4000-8000-00000000000e', 'a7700000-0000-4000-8000-00000000000e', 1),
  ('c0000000-0000-4000-8000-00000000000e', 'a7700000-0000-4000-8000-00000000000b', 2),
  ('c0000000-0000-4000-8000-00000000000f', 'a7700000-0000-4000-8000-00000000000f', 0),
  ('c0000000-0000-4000-8000-00000000000f', 'a7700000-0000-4000-8000-000000000010', 1),
  ('c0000000-0000-4000-8000-00000000000f', 'a7700000-0000-4000-8000-000000000011', 2),
  ('c0000000-0000-4000-8000-00000000000f', 'a7700000-0000-4000-8000-00000000000b', 3),
  ('c0000000-0000-4000-8000-000000000011', 'a7700000-0000-4000-8000-000000000012', 0),
  ('c0000000-0000-4000-8000-000000000011', 'a7700000-0000-4000-8000-00000000000d', 1),
  ('c0000000-0000-4000-8000-000000000011', 'a7700000-0000-4000-8000-00000000000b', 2),
  ('c0000000-0000-4000-8000-000000000012', 'a7700000-0000-4000-8000-000000000012', 0),
  ('c0000000-0000-4000-8000-000000000012', 'a7700000-0000-4000-8000-00000000000b', 1),
  ('c0000000-0000-4000-8000-000000000012', 'a7700000-0000-4000-8000-000000000002', 2),
  ('c0000000-0000-4000-8000-000000000014', 'a7700000-0000-4000-8000-00000000000f', 0),
  ('c0000000-0000-4000-8000-000000000014', 'a7700000-0000-4000-8000-000000000010', 1),
  ('c0000000-0000-4000-8000-000000000014', 'a7700000-0000-4000-8000-000000000013', 2),
  ('c0000000-0000-4000-8000-000000000015', 'a7700000-0000-4000-8000-00000000000b', 0),
  ('c0000000-0000-4000-8000-000000000015', 'a7700000-0000-4000-8000-00000000000d', 1),
  ('c0000000-0000-4000-8000-000000000017', 'a7700000-0000-4000-8000-000000000003', 0),
  ('c0000000-0000-4000-8000-000000000017', 'a7700000-0000-4000-8000-00000000000b', 1),
  ('c0000000-0000-4000-8000-000000000017', 'a7700000-0000-4000-8000-000000000002', 2),
  ('c0000000-0000-4000-8000-000000000018', 'a7700000-0000-4000-8000-000000000002', 0),
  ('c0000000-0000-4000-8000-000000000018', 'a7700000-0000-4000-8000-00000000000b', 1),
  ('c0000000-0000-4000-8000-000000000019', 'a7700000-0000-4000-8000-00000000000f', 0),
  ('c0000000-0000-4000-8000-000000000019', 'a7700000-0000-4000-8000-000000000010', 1),
  ('c0000000-0000-4000-8000-000000000019', 'a7700000-0000-4000-8000-000000000002', 2),
  ('c0000000-0000-4000-8000-00000000001b', 'a7700000-0000-4000-8000-00000000000b', 0),
  ('c0000000-0000-4000-8000-00000000001b', 'a7700000-0000-4000-8000-000000000002', 1),
  ('c0000000-0000-4000-8000-00000000001b', 'a7700000-0000-4000-8000-000000000001', 2),
  ('c0000000-0000-4000-8000-00000000001c', 'a7700000-0000-4000-8000-000000000002', 0),
  ('c0000000-0000-4000-8000-00000000001c', 'a7700000-0000-4000-8000-00000000000b', 1);


insert into public.environments (id, name, slug, summary, content, image_url, banner_url, sort_order) values
  ('e0000000-0000-4000-8000-000000000001', 'Banheiro', 'banheiro', 'Revestimentos que resistem à umidade, metais bem escolhidos e louças fáceis de limpar.', 'Um banheiro bem resolvido começa pela impermeabilização e termina nos detalhes: o acabamento do metal, a cor do rejunte e a iluminação do espelho.

Antes de escolher o revestimento, defina o caimento do piso para o ralo e verifique o tipo de registro instalado — isso orienta a escolha do acabamento correto.', 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=2000&q=80', 0),
  ('e0000000-0000-4000-8000-000000000002', 'Cozinha', 'cozinha', 'Superfícies fáceis de limpar, cuba na medida certa e torneira com bom alcance.', 'Na cozinha, a combinação entre piso resistente a manchas, revestimento de parede atrás da bancada e uma torneira com bica alta faz diferença no dia a dia.

Meça a bancada antes de escolher a cuba e considere a pressão de água do imóvel para escolher a torneira.', 'https://images.unsplash.com/photo-1617228069096-4638a7ffc906?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1617228069096-4638a7ffc906?auto=format&fit=crop&w=2000&q=80', 1),
  ('e0000000-0000-4000-8000-000000000003', 'Sala', 'sala', 'Grandes formatos, cores neutras e iluminação em camadas.', 'Porcelanatos de grande formato reduzem as juntas e ampliam visualmente o ambiente. Combine com pintura em tons neutros e pendentes para criar pontos de luz.', 'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=2000&q=80', 2),
  ('e0000000-0000-4000-8000-000000000004', 'Quarto', 'quarto', 'Conforto térmico, cores calmas e tomadas nos lugares certos.', 'Planeje tomadas ao lado da cama e para climatização antes de pintar. Tons suaves e acabamento acetinado facilitam a limpeza das paredes.', 'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&w=2000&q=80', 3),
  ('e0000000-0000-4000-8000-000000000005', 'Área externa', 'area-externa', 'Pisos antiderrapantes, tintas para fachada e materiais que aguentam sol e chuva.', 'Para áreas externas prefira pisos com acabamento antiderrapante e tintas com resistência a intempéries. Atenção ao caimento para escoamento da água.', 'https://images.unsplash.com/photo-1646083329522-f2dce8ed4063?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1646083329522-f2dce8ed4063?auto=format&fit=crop&w=2000&q=80', 4),
  ('e0000000-0000-4000-8000-000000000006', 'Lavanderia', 'lavanderia', 'Tanque, pontos de água e revestimentos resistentes à umidade.', 'Defina a posição da máquina, do tanque e do ponto de esgoto antes de revestir. Revestimentos cerâmicos na parede evitam infiltrações.', 'https://images.unsplash.com/photo-1682888818612-1c18ebecf3ec?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1682888818612-1c18ebecf3ec?auto=format&fit=crop&w=2000&q=80', 5),
  ('e0000000-0000-4000-8000-000000000007', 'Churrasqueira', 'churrasqueira', 'Área gourmet com materiais resistentes ao calor e fáceis de limpar.', 'Em áreas gourmet, use revestimentos que suportem gordura e calor e preveja pontos de água e iluminação adequados.', 'https://images.unsplash.com/photo-1623625434531-d130448273c1?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1623625434531-d130448273c1?auto=format&fit=crop&w=2000&q=80', 6);


insert into public.tags (id, slug, name) values
  ('7a900000-0000-4000-8000-000000000001', 'acrilica', 'Acrilica'),
  ('7a900000-0000-4000-8000-000000000002', 'alvenaria', 'Alvenaria'),
  ('7a900000-0000-4000-8000-000000000003', 'amadeirado', 'Amadeirado'),
  ('7a900000-0000-4000-8000-000000000004', 'antiderrapante', 'Antiderrapante'),
  ('7a900000-0000-4000-8000-000000000005', 'argamassa', 'Argamassa'),
  ('7a900000-0000-4000-8000-000000000006', 'banheiro', 'Banheiro'),
  ('7a900000-0000-4000-8000-000000000007', 'bateria', 'Bateria'),
  ('7a900000-0000-4000-8000-000000000008', 'cimento', 'Cimento'),
  ('7a900000-0000-4000-8000-000000000009', 'cimento-queimado', 'Cimento queimado'),
  ('7a900000-0000-4000-8000-00000000000a', 'cozinha', 'Cozinha'),
  ('7a900000-0000-4000-8000-00000000000b', 'design', 'Design'),
  ('7a900000-0000-4000-8000-00000000000c', 'economia-de-agua', 'Economia de agua'),
  ('7a900000-0000-4000-8000-00000000000d', 'eletrica', 'Eletrica'),
  ('7a900000-0000-4000-8000-00000000000e', 'estampado', 'Estampado'),
  ('7a900000-0000-4000-8000-00000000000f', 'estrutura', 'Estrutura'),
  ('7a900000-0000-4000-8000-000000000010', 'fachada', 'Fachada'),
  ('7a900000-0000-4000-8000-000000000011', 'ferramentas', 'Ferramentas'),
  ('7a900000-0000-4000-8000-000000000012', 'fios', 'Fios'),
  ('7a900000-0000-4000-8000-000000000013', 'grande-formato', 'Grande formato'),
  ('7a900000-0000-4000-8000-000000000014', 'hidraulica', 'Hidraulica'),
  ('7a900000-0000-4000-8000-000000000015', 'iluminacao', 'Iluminacao'),
  ('7a900000-0000-4000-8000-000000000016', 'impermeabilizacao', 'Impermeabilizacao'),
  ('7a900000-0000-4000-8000-000000000017', 'industrial', 'Industrial'),
  ('7a900000-0000-4000-8000-000000000018', 'inox', 'Inox'),
  ('7a900000-0000-4000-8000-000000000019', 'kit', 'Kit'),
  ('7a900000-0000-4000-8000-00000000001a', 'lavavel', 'Lavavel'),
  ('7a900000-0000-4000-8000-00000000001b', 'led', 'Led'),
  ('7a900000-0000-4000-8000-00000000001c', 'marmorizado', 'Marmorizado'),
  ('7a900000-0000-4000-8000-00000000001d', 'pintura', 'Pintura'),
  ('7a900000-0000-4000-8000-00000000001e', 'pvc', 'Pvc'),
  ('7a900000-0000-4000-8000-00000000001f', 'rejunte', 'Rejunte'),
  ('7a900000-0000-4000-8000-000000000020', 'retificado', 'Retificado'),
  ('7a900000-0000-4000-8000-000000000021', 'subway', 'Subway');


insert into public.products (id, name, slug, sku, short_description, description, brand_id, category_id, status, published_at, is_featured, is_new, is_on_sale, is_recommended, sale_starts_at, sale_ends_at, sale_label, price_display, price, sale_price, unit, availability, manufacturer, model, dimensions, weight_kg, warranty, package_contents, cta_label) values
  ('a0000000-0000-4000-8000-000000000001', 'Porcelanato Acetinado Calacata 90x90', 'porcelanato-acetinado-calacata-90x90', 'PRC-90090-CAL', 'Porcelanato retificado com veios suaves inspirados no mármore Calacata, ideal para salas e áreas internas amplas.', 'Porcelanato retificado de grande formato com acabamento acetinado, que reduz reflexos e facilita a limpeza.

### Indicações
- Pisos e paredes de áreas internas
- Salas, quartos, cozinhas e banheiros

### Dicas de instalação
Utilize argamassa AC-III e desempenadeira dentada. Recomenda-se junta mínima de 2 mm com rejunte acrílico ou epóxi.', 'b0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000006', 'published', now() - interval '78 days', true, false, true, false, now() - interval '1 day', now() + interval '45 days', 'Oferta especial', 'show', 189.9, 164.9, 'caixa', 'available_on_request', null, null, '90 x 90 cm', null, 'Conforme fabricante', '2 peças por caixa (1,62 m²)', null),
  ('a0000000-0000-4000-8000-000000000002', 'Porcelanato Polido Nero 120x120', 'porcelanato-polido-nero-120x120', 'PRC-12012-NER', 'Porcelanato preto polido de alto brilho para ambientes sofisticados.', 'Superfície polida de alto brilho em tom preto profundo. Indicado para áreas internas secas, como salas e halls.

Por ser polido, não é recomendado para áreas molhadas ou externas.', 'b0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000006', 'published', now() - interval '76 days', false, true, false, false, null, null, null, 'consult', null, null, 'caixa', 'available_on_request', null, null, null, null, null, null, null),
  ('a0000000-0000-4000-8000-000000000003', 'Porcelanato Externo Cimento 60x120', 'porcelanato-externo-cimento-60x120', 'PRC-60120-CIM', 'Acabamento antiderrapante com visual de cimento queimado para áreas externas.', 'Porcelanato técnico com textura que aumenta a aderência, ideal para varandas, áreas de churrasqueira e quintais.', 'b0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000006', 'published', now() - interval '74 days', false, false, false, true, null, null, null, 'show', 149.9, null, 'caixa', 'available_on_request', null, null, null, null, null, null, null),
  ('a0000000-0000-4000-8000-000000000004', 'Porcelanato Madeira Freijó 20x120', 'porcelanato-madeira-freijo-20x120', 'PRC-20120-FRE', 'Réguas com aparência de madeira natural e a resistência do porcelanato.', 'Visual aconchegante de madeira com a praticidade do porcelanato: não risca com facilidade e é fácil de limpar.', 'b0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000006', 'published', now() - interval '72 days', true, false, false, false, null, null, null, 'show', 119.9, null, 'caixa', 'available_on_request', null, null, null, null, null, null, null),
  ('a0000000-0000-4000-8000-000000000005', 'Revestimento Cerâmico Metro White 10x20', 'revestimento-ceramico-metro-white-10x20', 'CER-1020-MTW', 'Clássico revestimento estilo metrô, brilhante, para cozinhas e banheiros.', 'Peças com bordas bisotadas e acabamento brilhante. Combina com rejuntes claros ou contrastantes.', 'b0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000007', 'published', now() - interval '70 days', false, false, true, false, now() - interval '1 day', now() + interval '30 days', null, 'show', 69.9, 59.9, 'caixa', 'available_on_request', null, null, null, null, null, null, null),
  ('a0000000-0000-4000-8000-000000000006', 'Piso Cerâmico Hidráulico Estampado 20x20', 'piso-ceramico-hidraulico-20x20', 'CER-2020-HID', 'Estampas geométricas inspiradas no ladrilho hidráulico.', 'Perfeito para dar personalidade a lavabos, cozinhas e áreas gourmet.', 'b0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000007', 'published', now() - interval '68 days', false, true, false, false, null, null, null, 'consult', null, null, 'caixa', 'available_on_request', null, null, null, null, null, null, null),
  ('a0000000-0000-4000-8000-000000000007', 'Rejunte Acrílico Cinza Platina 1 kg', 'rejunte-acrilico-cinza-platina-1kg', 'REJ-ACR-CPL1', 'Rejunte acrílico pronto para uso, flexível e de fácil aplicação.', 'Indicado para porcelanatos e cerâmicas em áreas internas e externas. Pronto para uso.', 'b0000000-0000-4000-8000-000000000006', 'c0000000-0000-4000-8000-000000000008', 'published', now() - interval '66 days', false, false, false, false, null, null, null, 'show', 32.9, null, 'pote', 'available_on_request', null, null, null, null, null, null, null),
  ('a0000000-0000-4000-8000-000000000008', 'Cimento CP II-E-32 50 kg', 'cimento-cp-ii-e-32-50kg', 'CIM-CP2E-50', 'Cimento Portland composto para concreto, reboco e assentamento.', 'Cimento de uso geral para estruturas, contrapisos, rebocos e assentamento de blocos.

### Armazenamento
Mantenha os sacos em local seco, sobre estrados e afastados das paredes. Empilhe no máximo 10 sacos.', 'b0000000-0000-4000-8000-000000000006', 'c0000000-0000-4000-8000-000000000002', 'published', now() - interval '64 days', true, false, false, true, null, null, null, 'consult', null, null, 'saco', 'available_on_request', null, null, null, 50, null, null, 'Consultar preço por quantidade'),
  ('a0000000-0000-4000-8000-000000000009', 'Argamassa AC-III para Porcelanato 20 kg', 'argamassa-ac-iii-porcelanato-20kg', 'ARG-AC3-20', 'Argamassa colante de alta aderência para porcelanatos e grandes formatos.', 'Indicada para assentamento de porcelanatos em pisos e paredes internas e externas.', 'b0000000-0000-4000-8000-000000000006', 'c0000000-0000-4000-8000-000000000002', 'published', now() - interval '62 days', false, false, true, false, now() - interval '1 day', now() + interval '20 days', null, 'show', 54.9, 47.9, 'saco', 'available_on_request', null, null, null, 20, null, null, null),
  ('a0000000-0000-4000-8000-00000000000a', 'Argamassa Multiuso para Assentamento 20 kg', 'argamassa-assentamento-multiuso-20kg', 'ARG-MUL-20', 'Para assentamento de blocos e tijolos e revestimento de paredes.', 'Argamassa pronta: basta adicionar água. Uso em alvenaria de vedação e reboco.', 'b0000000-0000-4000-8000-000000000006', 'c0000000-0000-4000-8000-000000000002', 'published', now() - interval '60 days', false, false, false, false, null, null, null, 'on_request', null, null, 'saco', 'available_on_request', null, null, null, null, null, null, null),
  ('a0000000-0000-4000-8000-00000000000b', 'Bloco de Concreto Estrutural 14x19x39', 'bloco-de-concreto-estrutural-14x19x39', 'BLC-141939', 'Bloco estrutural para alvenaria com função estrutural.', 'Bloco vazado de concreto com resistência para alvenaria estrutural. Consulte quantidade mínima para entrega.', 'b0000000-0000-4000-8000-000000000006', 'c0000000-0000-4000-8000-000000000003', 'published', now() - interval '58 days', false, false, false, false, null, null, null, 'consult', null, null, 'unidade', 'available_on_request', null, null, null, null, null, null, 'Solicitar orçamento'),
  ('a0000000-0000-4000-8000-00000000000c', 'Tijolo Cerâmico 8 Furos 9x19x19', 'tijolo-ceramico-8-furos', 'TIJ-8F-91919', 'Tijolo cerâmico de vedação, vendido por milheiro.', 'Tijolo de vedação para paredes internas e externas.', 'b0000000-0000-4000-8000-000000000006', 'c0000000-0000-4000-8000-000000000003', 'published', now() - interval '56 days', false, false, false, true, null, null, null, 'consult', null, null, 'milheiro', 'available_on_request', null, null, null, null, null, null, 'Solicitar orçamento'),
  ('a0000000-0000-4000-8000-00000000000d', 'Argamassa Polimérica Impermeabilizante 18 kg', 'argamassa-polimerica-impermeabilizante-18kg', 'IMP-POL-18', 'Impermeabilização de banheiros, cozinhas, lajes e reservatórios.', 'Sistema bicomponente aplicado com trincha. Recomendado para áreas molhadas antes do revestimento.', 'b0000000-0000-4000-8000-000000000006', 'c0000000-0000-4000-8000-000000000004', 'published', now() - interval '54 days', true, false, false, false, null, null, null, 'show', 159.9, null, 'caixa', 'available_on_request', null, null, null, null, null, null, null),
  ('a0000000-0000-4000-8000-00000000000e', 'Tinta Acrílica Premium Fosca Branco Neve', 'tinta-acrilica-premium-fosca-branco-neve', 'TIN-ACR-FBN', 'Alto rendimento e cobertura para paredes internas e externas.', 'Tinta acrílica premium com acabamento fosco, que disfarça imperfeições da parede.

### Rendimento
Até 380 m² por demão na lata de 18 L, dependendo da superfície.', 'b0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-00000000000a', 'published', now() - interval '52 days', true, false, true, false, now() - interval '1 day', now() + interval '30 days', null, 'show', 489.9, 429.9, 'lata', 'available_on_request', null, null, null, null, null, null, null),
  ('a0000000-0000-4000-8000-00000000000f', 'Tinta Acrílica Acetinada Cinza Urbano', 'tinta-acrilica-acetinada-cinza-urbano', 'TIN-ACR-ACU', 'Acabamento acetinado lavável para áreas de grande circulação.', 'Ideal para corredores, quartos infantis e cozinhas. Pode ser limpa com pano úmido.', 'b0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-00000000000a', 'published', now() - interval '50 days', false, true, false, false, null, null, null, 'show', 139.9, null, 'lata', 'available_on_request', null, null, null, null, null, null, null),
  ('a0000000-0000-4000-8000-000000000010', 'Tinta Emborrachada para Fachada 18 L', 'tinta-emborrachada-fachada', 'TIN-EMB-18', 'Proteção elástica contra chuva e microfissuras em fachadas.', 'Forma uma película elástica que acompanha a movimentação da parede.', 'b0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-00000000000a', 'published', now() - interval '48 days', false, false, false, false, null, null, null, 'consult', null, null, 'lata', 'available_on_request', null, null, null, null, null, null, null),
  ('a0000000-0000-4000-8000-000000000011', 'Kit Rolo de Lã 23 cm com Bandeja', 'kit-rolo-de-la-23cm-com-bandeja', 'ACP-KIT-23', 'Rolo de lã sintética, cabo e bandeja para pintura de paredes.', 'Kit prático para pintura com tintas acrílicas e látex.', 'b0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-00000000000b', 'published', now() - interval '46 days', false, false, false, false, null, null, null, 'show', 39.9, null, 'kit', 'available_on_request', null, null, null, null, null, '1 rolo de 23 cm, 1 cabo, 1 bandeja', null),
  ('a0000000-0000-4000-8000-000000000012', 'Trincha Cerdas Gris 2"', 'trincha-cerdas-gris-2-polegadas', 'ACP-TRI-2', 'Trincha para recortes e acabamentos.', 'Cerdas firmes para recortes em cantos, rodapés e esquadrias.', 'b0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-00000000000b', 'published', now() - interval '44 days', false, false, false, false, null, null, null, 'show', 14.9, null, 'unidade', 'available_on_request', null, null, null, null, null, null, null),
  ('a0000000-0000-4000-8000-000000000013', 'Cabo Flexível 2,5 mm² Rolo 100 m', 'cabo-flexivel-2-5mm-rolo-100m', 'ELE-CAB-25-100', 'Cabo flexível 750 V para circuitos de tomadas.', 'Cabo de cobre flexível com isolação antichama. Indicado para circuitos de tomadas de uso geral.', 'b0000000-0000-4000-8000-000000000008', 'c0000000-0000-4000-8000-00000000000d', 'published', now() - interval '42 days', true, false, false, false, null, null, null, 'show', 279.9, null, 'rolo', 'available_on_request', null, null, null, null, null, null, null),
  ('a0000000-0000-4000-8000-000000000014', 'Conjunto Tomada 2P+T 10 A Branco', 'conjunto-tomada-2p-t-10a-branco', 'ELE-TOM-10B', 'Tomada padrão brasileiro com placa 4x2.', 'Conjunto montado com placa e suporte. Atende ao padrão NBR 14136.', 'b0000000-0000-4000-8000-000000000005', 'c0000000-0000-4000-8000-00000000000e', 'published', now() - interval '40 days', false, false, false, false, null, null, null, 'show', 12.9, null, 'unidade', 'available_on_request', null, null, null, null, null, null, null),
  ('a0000000-0000-4000-8000-000000000015', 'Interruptor Simples Preto Fosco', 'interruptor-simples-preto-fosco', 'ELE-INT-PF', 'Interruptor de design minimalista em preto fosco.', 'Linha de acabamento contemporâneo com placa sem parafusos aparentes.', 'b0000000-0000-4000-8000-000000000005', 'c0000000-0000-4000-8000-00000000000e', 'published', now() - interval '38 days', false, true, false, false, null, null, null, 'show', 24.9, null, 'unidade', 'available_on_request', null, null, null, null, null, null, null),
  ('a0000000-0000-4000-8000-000000000016', 'Pendente Industrial Alumínio Preto', 'pendente-industrial-aluminio-preto', 'ILU-PEN-IND', 'Pendente cúpula em alumínio para bancadas e mesas.', 'Cúpula em alumínio com pintura eletrostática. Compatível com lâmpadas E27.', 'b0000000-0000-4000-8000-000000000005', 'c0000000-0000-4000-8000-00000000000f', 'published', now() - interval '36 days', true, false, true, false, now() - interval '1 day', now() + interval '15 days', null, 'show', 159.9, 129.9, 'unidade', 'available_on_request', null, null, null, null, null, null, null),
  ('a0000000-0000-4000-8000-000000000017', 'Lâmpada LED Bulbo 9 W', 'lampada-led-bulbo-9w', 'ILU-LED-9W', 'Lâmpada LED econômica com base E27.', 'Economia de energia e longa vida útil.', 'b0000000-0000-4000-8000-000000000005', 'c0000000-0000-4000-8000-00000000000f', 'published', now() - interval '34 days', false, false, false, false, null, null, null, 'show', 9.9, null, 'unidade', 'available_on_request', null, null, null, null, null, null, null),
  ('a0000000-0000-4000-8000-000000000018', 'Tubo PVC Soldável 25 mm Barra 6 m', 'tubo-pvc-soldavel-25mm-6m', 'HID-TUB-25', 'Tubo para água fria em instalações prediais.', 'Tubo de PVC soldável para condução de água fria.', 'b0000000-0000-4000-8000-000000000004', 'c0000000-0000-4000-8000-000000000011', 'published', now() - interval '32 days', false, false, false, false, null, null, null, 'show', 34.9, null, 'barra', 'available_on_request', null, null, null, null, null, null, null),
  ('a0000000-0000-4000-8000-000000000019', 'Joelho 90° PVC Soldável 25 mm', 'joelho-90-pvc-soldavel-25mm', 'HID-JOE-25', 'Conexão para mudança de direção em 90°.', 'Conexão soldável para água fria.', 'b0000000-0000-4000-8000-000000000004', 'c0000000-0000-4000-8000-000000000011', 'published', now() - interval '30 days', false, false, false, false, null, null, null, 'show', 1.9, null, 'unidade', 'available_on_request', null, null, null, null, null, null, null),
  ('a0000000-0000-4000-8000-00000000001a', 'Registro de Gaveta 3/4" Bruto', 'registro-de-gaveta-3-4-bruto', 'HID-REG-34', 'Registro de gaveta em liga metálica para instalações de água.', 'Utilize com acabamento compatível da mesma linha.', 'b0000000-0000-4000-8000-000000000004', 'c0000000-0000-4000-8000-000000000012', 'published', now() - interval '28 days', false, false, false, false, null, null, null, 'consult', null, null, 'unidade', 'available_on_request', null, null, null, null, null, null, null),
  ('a0000000-0000-4000-8000-00000000001b', 'Furadeira de Impacto 650 W', 'furadeira-de-impacto-650w', 'FER-FUR-650', 'Furadeira com impacto para alvenaria, madeira e metal.', 'Mandril de 1/2", controle de velocidade e reversão. Acompanha empunhadura auxiliar e limitador de profundidade.', 'b0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000014', 'published', now() - interval '26 days', true, false, false, true, null, null, null, 'show', 349.9, null, 'unidade', 'available_on_request', null, null, null, null, '12 meses (conforme fabricante)', 'Furadeira, empunhadura auxiliar e limitador de profundidade', null),
  ('a0000000-0000-4000-8000-00000000001c', 'Parafusadeira a Bateria 12 V', 'parafusadeira-a-bateria-12v', 'FER-PAR-12', 'Leve e compacta, com 2 velocidades e luz LED.', 'Ideal para montagem de móveis e pequenos reparos.', 'b0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000014', 'published', now() - interval '24 days', false, true, true, false, now() - interval '1 day', now() + interval '25 days', null, 'show', 399.9, 359.9, 'unidade', 'available_on_request', null, null, null, null, null, null, null),
  ('a0000000-0000-4000-8000-00000000001d', 'Martelo de Unha 27 mm Cabo de Fibra', 'martelo-unha-27mm-cabo-fibra', 'FER-MAR-27', 'Cabeça forjada e cabo antivibração.', 'Martelo de unha para carpintaria e uso geral.', 'b0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000015', 'published', now() - interval '22 days', false, false, false, false, null, null, null, 'show', 59.9, null, 'unidade', 'available_on_request', null, null, null, null, null, null, null),
  ('a0000000-0000-4000-8000-00000000001e', 'Jogo de Chaves Combinadas 8 Peças', 'jogo-de-chaves-combinadas-8-pecas', 'FER-CHV-8', 'Chaves combinadas de 8 a 19 mm em aço cromo-vanádio.', 'Acompanha estojo organizador.', 'b0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000015', 'published', now() - interval '20 days', false, false, false, false, null, null, null, 'show', 119.9, null, 'jogo', 'available_on_request', null, null, null, null, null, null, null),
  ('a0000000-0000-4000-8000-00000000001f', 'Kit de Ferramentas Básico para Casa', 'kit-ferramentas-basico-casa', 'FER-KIT-CASA', 'Martelo, chaves de fenda, alicate e trena em uma maleta.', 'O essencial para pequenos reparos domésticos.', 'b0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000015', 'published', now() - interval '18 days', false, false, false, true, null, null, null, 'show', 189.9, null, 'kit', 'available_on_request', null, null, null, null, null, null, null),
  ('a0000000-0000-4000-8000-000000000020', 'Cuba de Apoio Retangular Branca', 'cuba-de-apoio-retangular-branca', 'BAN-CUB-RET', 'Cuba de apoio em louça com linhas retas.', 'Para bancadas de banheiro e lavabo. Torneira de mesa ou parede vendida separadamente.', 'b0000000-0000-4000-8000-000000000007', 'c0000000-0000-4000-8000-000000000017', 'published', now() - interval '16 days', true, false, false, false, null, null, null, 'show', 329.9, null, 'unidade', 'available_on_request', null, null, '50 x 36 x 13 cm', null, null, null, null),
  ('a0000000-0000-4000-8000-000000000021', 'Bacia com Caixa Acoplada Dual Flush', 'bacia-com-caixa-acoplada-dual-flush', 'BAN-BAC-DF', 'Acionamento duplo para economia de água.', 'Conjunto com bacia, caixa acoplada e mecanismo de acionamento duplo.', 'b0000000-0000-4000-8000-000000000007', 'c0000000-0000-4000-8000-000000000017', 'published', now() - interval '14 days', false, false, false, false, null, null, null, 'consult', null, null, 'conjunto', 'made_to_order', null, null, null, null, null, null, null),
  ('a0000000-0000-4000-8000-000000000022', 'Misturador Monocomando para Lavatório Preto Fosco', 'misturador-monocomando-lavatorio-preto', 'BAN-MIS-PF', 'Monocomando de bica alta em preto fosco.', 'Controle de temperatura e vazão em um único comando. Indicado para cubas de apoio.', 'b0000000-0000-4000-8000-000000000004', 'c0000000-0000-4000-8000-000000000018', 'published', now() - interval '12 days', true, true, false, false, null, null, null, 'show', 689.9, null, 'unidade', 'available_on_request', null, null, null, null, null, null, null),
  ('a0000000-0000-4000-8000-000000000023', 'Torneira de Mesa Cromada para Lavatório', 'torneira-de-mesa-cromada-lavatorio', 'BAN-TOR-CR', 'Torneira de mesa com arejador e acabamento cromado.', 'Modelo clássico para lavatórios e lavabos.', 'b0000000-0000-4000-8000-000000000004', 'c0000000-0000-4000-8000-000000000018', 'published', now() - interval '10 days', false, false, true, false, now() - interval '1 day', now() + interval '10 days', null, 'show', 149.9, 119.9, 'unidade', 'available_on_request', null, null, null, null, null, null, null),
  ('a0000000-0000-4000-8000-000000000024', 'Chuveiro Elétrico Multitemperaturas 7500 W', 'chuveiro-eletrico-multitemperaturas-7500w', 'BAN-CHU-7500', 'Quatro temperaturas e espalhador amplo.', 'Verifique a bitola do circuito e o disjuntor antes da instalação.', 'b0000000-0000-4000-8000-000000000005', 'c0000000-0000-4000-8000-000000000019', 'published', now() - interval '8 days', false, false, false, false, null, null, null, 'show', 179.9, null, 'unidade', 'available_on_request', null, null, null, null, null, null, null),
  ('a0000000-0000-4000-8000-000000000025', 'Cuba Inox Gourmet 60x40', 'cuba-inox-gourmet-60x40', 'COZ-CUB-6040', 'Cuba de embutir em aço inox escovado com cantos retos.', 'Acompanha válvula e sifão. Profundidade generosa para panelas grandes.', 'b0000000-0000-4000-8000-000000000004', 'c0000000-0000-4000-8000-00000000001b', 'published', now() - interval '6 days', true, false, false, true, null, null, null, 'show', 899.9, null, 'unidade', 'available_on_request', null, null, null, null, null, null, null),
  ('a0000000-0000-4000-8000-000000000026', 'Torneira Gourmet com Bica Móvel', 'torneira-gourmet-bica-movel', 'COZ-TOR-GOU', 'Bica flexível com duas funções de jato.', 'Combina com cubas gourmet e bancadas de pedra.', 'b0000000-0000-4000-8000-000000000004', 'c0000000-0000-4000-8000-00000000001c', 'published', now() - interval '4 days', false, true, true, false, now() - interval '1 day', now() + interval '30 days', null, 'show', 549.9, 489.9, 'unidade', 'available_on_request', null, null, null, null, null, null, null),
  ('a0000000-0000-4000-8000-000000000027', 'Torneira de Parede para Cozinha Cromada', 'torneira-de-parede-cozinha-cromada', 'COZ-TOR-PAR', 'Bica longa giratória para cozinhas e tanques.', 'Modelo de parede com arejador articulado.', 'b0000000-0000-4000-8000-000000000004', 'c0000000-0000-4000-8000-00000000001c', 'published', now() - interval '2 days', false, false, false, false, null, null, null, 'show', 129.9, null, 'unidade', 'temporarily_unavailable', null, null, null, null, null, null, null);


insert into public.product_images (id, product_id, url, alt, is_cover, sort_order) values
  ('1a900000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'https://images.unsplash.com/photo-1706629503571-c165023a7792?auto=format&fit=crop&w=1400&q=80', 'Piso de porcelanato branco com veios cinza em ambiente amplo', true, 0),
  ('1a900000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'https://images.unsplash.com/photo-1706629503586-2731f65587ae?auto=format&fit=crop&w=1400&q=80', 'Ambiente com piso de porcelanato marmorizado', false, 1),
  ('1a900000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000002', 'https://images.unsplash.com/photo-1534503442463-e0ddba45cf4c?auto=format&fit=crop&w=1400&q=80', 'Piso escuro de porcelanato em ambiente interno', true, 0),
  ('1a900000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000003', 'https://images.unsplash.com/photo-1614598632980-35ee54daa5b9?auto=format&fit=crop&w=1400&q=80', 'Revestimento cinza com textura de cimento', true, 0),
  ('1a900000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000004', 'https://images.unsplash.com/photo-1611072337226-1140ab367200?auto=format&fit=crop&w=1400&q=80', 'Textura de madeira clara em réguas', true, 0),
  ('1a900000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000005', 'https://images.unsplash.com/photo-1523350165414-082d792c4bcc?auto=format&fit=crop&w=1400&q=80', 'Parede com azulejos cerâmicos', true, 0),
  ('1a900000-0000-4000-8000-000000000007', 'a0000000-0000-4000-8000-000000000006', 'https://images.unsplash.com/photo-1551893478-d726eaf0442c?auto=format&fit=crop&w=1400&q=80', 'Revestimento com padrão geométrico', true, 0),
  ('1a900000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-000000000007', 'https://images.unsplash.com/photo-1584354273341-3eb96574e5be?auto=format&fit=crop&w=1400&q=80', 'Revestimento cerâmico com rejunte', true, 0),
  ('1a900000-0000-4000-8000-000000000009', 'a0000000-0000-4000-8000-000000000008', 'https://images.unsplash.com/photo-1533378890784-b2a5b0a59d40?auto=format&fit=crop&w=1400&q=80', 'Obra com armação de ferro e concreto', true, 0),
  ('1a900000-0000-4000-8000-00000000000a', 'a0000000-0000-4000-8000-000000000009', 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1400&q=80', 'Trabalhadores em canteiro de obras', true, 0),
  ('1a900000-0000-4000-8000-00000000000b', 'a0000000-0000-4000-8000-00000000000a', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1400&q=80', 'Profissionais trabalhando em obra', true, 0),
  ('1a900000-0000-4000-8000-00000000000c', 'a0000000-0000-4000-8000-00000000000b', 'https://images.unsplash.com/photo-1520758594221-872948699332?auto=format&fit=crop&w=1400&q=80', 'Blocos de concreto empilhados', true, 0),
  ('1a900000-0000-4000-8000-00000000000d', 'a0000000-0000-4000-8000-00000000000c', 'https://images.unsplash.com/photo-1495578942200-c5f5d2137def?auto=format&fit=crop&w=1400&q=80', 'Parede de tijolos cerâmicos', true, 0),
  ('1a900000-0000-4000-8000-00000000000e', 'a0000000-0000-4000-8000-00000000000d', 'https://images.unsplash.com/photo-1487088678257-3a541e6e3922?auto=format&fit=crop&w=1400&q=80', 'Blocos de concreto pintados', true, 0),
  ('1a900000-0000-4000-8000-00000000000f', 'a0000000-0000-4000-8000-00000000000e', 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=1400&q=80', 'Pessoa pintando parede com rolo', true, 0),
  ('1a900000-0000-4000-8000-000000000010', 'a0000000-0000-4000-8000-00000000000e', 'https://images.unsplash.com/photo-1456086272160-b28b0645b729?auto=format&fit=crop&w=1400&q=80', 'Latas de tinta de cores variadas', false, 1),
  ('1a900000-0000-4000-8000-000000000011', 'a0000000-0000-4000-8000-00000000000f', 'https://images.unsplash.com/photo-1585676737728-432f58d5fdba?auto=format&fit=crop&w=1400&q=80', 'Lata de tinta sobre mesa branca', true, 0),
  ('1a900000-0000-4000-8000-000000000012', 'a0000000-0000-4000-8000-000000000010', 'https://images.unsplash.com/photo-1550002233-59d811d29b95?auto=format&fit=crop&w=1400&q=80', 'Lata de tinta amarela ao lado de parede azul', true, 0),
  ('1a900000-0000-4000-8000-000000000013', 'a0000000-0000-4000-8000-000000000011', 'https://images.unsplash.com/photo-1525909002-1b05e0c869d8?auto=format&fit=crop&w=1400&q=80', 'Rolos de pintura coloridos', true, 0),
  ('1a900000-0000-4000-8000-000000000014', 'a0000000-0000-4000-8000-000000000012', 'https://images.unsplash.com/photo-1516962080544-eac695c93791?auto=format&fit=crop&w=1400&q=80', 'Rolo e trincha de pintura', true, 0),
  ('1a900000-0000-4000-8000-000000000015', 'a0000000-0000-4000-8000-000000000013', 'https://images.unsplash.com/photo-1601462904263-f2fa0c851cb9?auto=format&fit=crop&w=1400&q=80', 'Fios elétricos coloridos', true, 0),
  ('1a900000-0000-4000-8000-000000000016', 'a0000000-0000-4000-8000-000000000014', 'https://images.unsplash.com/photo-1612257911111-074bd8388f88?auto=format&fit=crop&w=1400&q=80', 'Interruptor de parede', true, 0),
  ('1a900000-0000-4000-8000-000000000017', 'a0000000-0000-4000-8000-000000000015', 'https://images.unsplash.com/photo-1508920291026-c344bbfca1ab?auto=format&fit=crop&w=1400&q=80', 'Régua de tomadas montada na parede', true, 0),
  ('1a900000-0000-4000-8000-000000000018', 'a0000000-0000-4000-8000-000000000016', 'https://images.unsplash.com/photo-1512418408532-5445158b1445?auto=format&fit=crop&w=1400&q=80', 'Três pendentes pretos', true, 0),
  ('1a900000-0000-4000-8000-000000000019', 'a0000000-0000-4000-8000-000000000016', 'https://images.unsplash.com/photo-1592622515232-6e3e2a0d3d9a?auto=format&fit=crop&w=1400&q=80', 'Pendente preto aceso', false, 1),
  ('1a900000-0000-4000-8000-00000000001a', 'a0000000-0000-4000-8000-000000000017', 'https://images.unsplash.com/photo-1559924508-1461423083c5?auto=format&fit=crop&w=1400&q=80', 'Lâmpada acesa em pendente', true, 0),
  ('1a900000-0000-4000-8000-00000000001b', 'a0000000-0000-4000-8000-000000000018', 'https://images.unsplash.com/photo-1545193329-4a052e14eb8f?auto=format&fit=crop&w=1400&q=80', 'Tubo branco de PVC', true, 0),
  ('1a900000-0000-4000-8000-00000000001c', 'a0000000-0000-4000-8000-000000000019', 'https://images.unsplash.com/photo-1729169927271-7826d8aae360?auto=format&fit=crop&w=1400&q=80', 'Tubos e conexões empilhados', true, 0),
  ('1a900000-0000-4000-8000-00000000001d', 'a0000000-0000-4000-8000-00000000001a', 'https://images.unsplash.com/photo-1619365566184-272a34acfeb9?auto=format&fit=crop&w=1400&q=80', 'Torneira de latão com gotas de água', true, 0),
  ('1a900000-0000-4000-8000-00000000001e', 'a0000000-0000-4000-8000-00000000001b', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1400&q=80', 'Furadeira sem fio vermelha', true, 0),
  ('1a900000-0000-4000-8000-00000000001f', 'a0000000-0000-4000-8000-00000000001c', 'https://images.unsplash.com/photo-1622044939413-0b829c342434?auto=format&fit=crop&w=1400&q=80', 'Parafusadeira sem fio verde e preta', true, 0),
  ('1a900000-0000-4000-8000-000000000020', 'a0000000-0000-4000-8000-00000000001d', 'https://images.unsplash.com/photo-1586864387789-628af9feed72?auto=format&fit=crop&w=1400&q=80', 'Martelo de garra preto e prateado', true, 0),
  ('1a900000-0000-4000-8000-000000000021', 'a0000000-0000-4000-8000-00000000001e', 'https://images.unsplash.com/photo-1503789146722-cf137a3c0fea?auto=format&fit=crop&w=1400&q=80', 'Chaves ajustáveis', true, 0),
  ('1a900000-0000-4000-8000-000000000022', 'a0000000-0000-4000-8000-00000000001f', 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=1400&q=80', 'Martelo e chave de fenda', true, 0),
  ('1a900000-0000-4000-8000-000000000023', 'a0000000-0000-4000-8000-000000000020', 'https://images.unsplash.com/photo-1629079447777-1e605162dc8d?auto=format&fit=crop&w=1400&q=80', 'Pia de cerâmica branca com espelho', true, 0),
  ('1a900000-0000-4000-8000-000000000024', 'a0000000-0000-4000-8000-000000000021', 'https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?auto=format&fit=crop&w=1400&q=80', 'Banheiro com vaso sanitário e pia', true, 0),
  ('1a900000-0000-4000-8000-000000000025', 'a0000000-0000-4000-8000-000000000022', 'https://images.unsplash.com/photo-1602761004880-0cbb1ba589d2?auto=format&fit=crop&w=1400&q=80', 'Torneira preta em pia branca', true, 0),
  ('1a900000-0000-4000-8000-000000000026', 'a0000000-0000-4000-8000-000000000023', 'https://images.unsplash.com/photo-1600488999585-e4364713b90a?auto=format&fit=crop&w=1400&q=80', 'Pia branca com torneira cromada', true, 0),
  ('1a900000-0000-4000-8000-000000000027', 'a0000000-0000-4000-8000-000000000024', 'https://images.unsplash.com/photo-1651951646668-46562cfb4518?auto=format&fit=crop&w=1400&q=80', 'Banheiro com box de vidro e chuveiro', true, 0),
  ('1a900000-0000-4000-8000-000000000028', 'a0000000-0000-4000-8000-000000000025', 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=1400&q=80', 'Cozinha com bancada e cuba', true, 0),
  ('1a900000-0000-4000-8000-000000000029', 'a0000000-0000-4000-8000-000000000026', 'https://images.unsplash.com/photo-1610278764397-388d11c35ddb?auto=format&fit=crop&w=1400&q=80', 'Torneira de aço inoxidável em pia', true, 0),
  ('1a900000-0000-4000-8000-00000000002a', 'a0000000-0000-4000-8000-000000000027', 'https://images.unsplash.com/photo-1587093430416-0dc23a0c62c1?auto=format&fit=crop&w=1400&q=80', 'Torneira de inox em pia branca', true, 0);


insert into public.product_variant_options (id, product_id, name, is_required, sort_order) values
  ('0b700000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Formato', true, 0),
  ('0b700000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000007', 'Cor', true, 0),
  ('0b700000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-00000000000e', 'Embalagem', true, 0),
  ('0b700000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-00000000000f', 'Embalagem', true, 0),
  ('0b700000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000013', 'Cor', true, 0),
  ('0b700000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000013', 'Bitola', true, 1),
  ('0b700000-0000-4000-8000-000000000007', 'a0000000-0000-4000-8000-000000000014', 'Corrente', true, 0),
  ('0b700000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-000000000017', 'Cor da luz', true, 0),
  ('0b700000-0000-4000-8000-000000000009', 'a0000000-0000-4000-8000-000000000018', 'Diâmetro', true, 0),
  ('0b700000-0000-4000-8000-00000000000a', 'a0000000-0000-4000-8000-00000000001b', 'Voltagem', true, 0),
  ('0b700000-0000-4000-8000-00000000000b', 'a0000000-0000-4000-8000-000000000022', 'Acabamento', true, 0),
  ('0b700000-0000-4000-8000-00000000000c', 'a0000000-0000-4000-8000-000000000024', 'Voltagem', true, 0);


insert into public.product_variants (id, product_id, option_id, label, sku, price, sale_price, sort_order) values
  ('7a400000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', '0b700000-0000-4000-8000-000000000001', '60x60', 'PRC-60060-CAL', 129.9, null, 0),
  ('7a400000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', '0b700000-0000-4000-8000-000000000001', '90x90', 'PRC-90090-CAL', 189.9, 164.9, 1),
  ('7a400000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', '0b700000-0000-4000-8000-000000000001', '120x120', 'PRC-12012-CAL', 279.9, null, 2),
  ('7a400000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000007', '0b700000-0000-4000-8000-000000000002', 'Cinza platina', null, null, null, 0),
  ('7a400000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000007', '0b700000-0000-4000-8000-000000000002', 'Branco', null, null, null, 1),
  ('7a400000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000007', '0b700000-0000-4000-8000-000000000002', 'Grafite', null, null, null, 2),
  ('7a400000-0000-4000-8000-000000000007', 'a0000000-0000-4000-8000-000000000007', '0b700000-0000-4000-8000-000000000002', 'Bege', null, null, null, 3),
  ('7a400000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-00000000000e', '0b700000-0000-4000-8000-000000000003', '3,6 L', 'TIN-ACR-FBN-36', 129.9, null, 0),
  ('7a400000-0000-4000-8000-000000000009', 'a0000000-0000-4000-8000-00000000000e', '0b700000-0000-4000-8000-000000000003', '18 L', 'TIN-ACR-FBN-18', 489.9, 429.9, 1),
  ('7a400000-0000-4000-8000-00000000000a', 'a0000000-0000-4000-8000-00000000000f', '0b700000-0000-4000-8000-000000000004', '3,6 L', null, 139.9, null, 0),
  ('7a400000-0000-4000-8000-00000000000b', 'a0000000-0000-4000-8000-00000000000f', '0b700000-0000-4000-8000-000000000004', '18 L', null, 559.9, null, 1),
  ('7a400000-0000-4000-8000-00000000000c', 'a0000000-0000-4000-8000-000000000013', '0b700000-0000-4000-8000-000000000005', 'Azul', null, null, null, 0),
  ('7a400000-0000-4000-8000-00000000000d', 'a0000000-0000-4000-8000-000000000013', '0b700000-0000-4000-8000-000000000005', 'Preto', null, null, null, 1),
  ('7a400000-0000-4000-8000-00000000000e', 'a0000000-0000-4000-8000-000000000013', '0b700000-0000-4000-8000-000000000005', 'Vermelho', null, null, null, 2),
  ('7a400000-0000-4000-8000-00000000000f', 'a0000000-0000-4000-8000-000000000013', '0b700000-0000-4000-8000-000000000005', 'Verde', null, null, null, 3),
  ('7a400000-0000-4000-8000-000000000010', 'a0000000-0000-4000-8000-000000000013', '0b700000-0000-4000-8000-000000000005', 'Branco', null, null, null, 4),
  ('7a400000-0000-4000-8000-000000000011', 'a0000000-0000-4000-8000-000000000013', '0b700000-0000-4000-8000-000000000006', '1,5 mm²', null, 189.9, null, 0),
  ('7a400000-0000-4000-8000-000000000012', 'a0000000-0000-4000-8000-000000000013', '0b700000-0000-4000-8000-000000000006', '2,5 mm²', null, 279.9, null, 1),
  ('7a400000-0000-4000-8000-000000000013', 'a0000000-0000-4000-8000-000000000013', '0b700000-0000-4000-8000-000000000006', '4,0 mm²', null, 449.9, null, 2),
  ('7a400000-0000-4000-8000-000000000014', 'a0000000-0000-4000-8000-000000000013', '0b700000-0000-4000-8000-000000000006', '6,0 mm²', null, 649.9, null, 3),
  ('7a400000-0000-4000-8000-000000000015', 'a0000000-0000-4000-8000-000000000014', '0b700000-0000-4000-8000-000000000007', '10 A', null, 12.9, null, 0),
  ('7a400000-0000-4000-8000-000000000016', 'a0000000-0000-4000-8000-000000000014', '0b700000-0000-4000-8000-000000000007', '20 A', null, 15.9, null, 1),
  ('7a400000-0000-4000-8000-000000000017', 'a0000000-0000-4000-8000-000000000017', '0b700000-0000-4000-8000-000000000008', 'Branca fria 6500K', null, null, null, 0),
  ('7a400000-0000-4000-8000-000000000018', 'a0000000-0000-4000-8000-000000000017', '0b700000-0000-4000-8000-000000000008', 'Branca quente 3000K', null, null, null, 1),
  ('7a400000-0000-4000-8000-000000000019', 'a0000000-0000-4000-8000-000000000018', '0b700000-0000-4000-8000-000000000009', '20 mm', null, 26.9, null, 0),
  ('7a400000-0000-4000-8000-00000000001a', 'a0000000-0000-4000-8000-000000000018', '0b700000-0000-4000-8000-000000000009', '25 mm', null, 34.9, null, 1),
  ('7a400000-0000-4000-8000-00000000001b', 'a0000000-0000-4000-8000-000000000018', '0b700000-0000-4000-8000-000000000009', '32 mm', null, 54.9, null, 2),
  ('7a400000-0000-4000-8000-00000000001c', 'a0000000-0000-4000-8000-000000000018', '0b700000-0000-4000-8000-000000000009', '50 mm', null, 89.9, null, 3),
  ('7a400000-0000-4000-8000-00000000001d', 'a0000000-0000-4000-8000-00000000001b', '0b700000-0000-4000-8000-00000000000a', '127 V', null, null, null, 0),
  ('7a400000-0000-4000-8000-00000000001e', 'a0000000-0000-4000-8000-00000000001b', '0b700000-0000-4000-8000-00000000000a', '220 V', null, null, null, 1),
  ('7a400000-0000-4000-8000-00000000001f', 'a0000000-0000-4000-8000-000000000022', '0b700000-0000-4000-8000-00000000000b', 'Preto fosco', null, 689.9, null, 0),
  ('7a400000-0000-4000-8000-000000000020', 'a0000000-0000-4000-8000-000000000022', '0b700000-0000-4000-8000-00000000000b', 'Cromado', null, 589.9, null, 1),
  ('7a400000-0000-4000-8000-000000000021', 'a0000000-0000-4000-8000-000000000022', '0b700000-0000-4000-8000-00000000000b', 'Dourado escovado', null, 799.9, null, 2),
  ('7a400000-0000-4000-8000-000000000022', 'a0000000-0000-4000-8000-000000000024', '0b700000-0000-4000-8000-00000000000c', '127 V (5500 W)', null, 169.9, null, 0),
  ('7a400000-0000-4000-8000-000000000023', 'a0000000-0000-4000-8000-000000000024', '0b700000-0000-4000-8000-00000000000c', '220 V (7500 W)', null, 179.9, null, 1);


insert into public.product_specifications (id, product_id, attribute_id, value, sort_order) values
  ('5bec0000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'a7700000-0000-4000-8000-000000000001', '90x90', 0),
  ('5bec0000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'a7700000-0000-4000-8000-000000000002', 'Acetinado', 1),
  ('5bec0000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'a7700000-0000-4000-8000-000000000003', 'Branco', 2),
  ('5bec0000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'a7700000-0000-4000-8000-000000000004', '9,5', 3),
  ('5bec0000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000001', 'a7700000-0000-4000-8000-000000000005', '1,62', 4),
  ('5bec0000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000001', 'a7700000-0000-4000-8000-000000000006', 'Piso e parede', 5),
  ('5bec0000-0000-4000-8000-000000000007', 'a0000000-0000-4000-8000-000000000002', 'a7700000-0000-4000-8000-000000000001', '120x120', 0),
  ('5bec0000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-000000000002', 'a7700000-0000-4000-8000-000000000002', 'Polido', 1),
  ('5bec0000-0000-4000-8000-000000000009', 'a0000000-0000-4000-8000-000000000002', 'a7700000-0000-4000-8000-000000000003', 'Preto', 2),
  ('5bec0000-0000-4000-8000-00000000000a', 'a0000000-0000-4000-8000-000000000002', 'a7700000-0000-4000-8000-000000000004', '10', 3),
  ('5bec0000-0000-4000-8000-00000000000b', 'a0000000-0000-4000-8000-000000000002', 'a7700000-0000-4000-8000-000000000005', '1,44', 4),
  ('5bec0000-0000-4000-8000-00000000000c', 'a0000000-0000-4000-8000-000000000002', 'a7700000-0000-4000-8000-000000000006', 'Piso interno', 5),
  ('5bec0000-0000-4000-8000-00000000000d', 'a0000000-0000-4000-8000-000000000003', 'a7700000-0000-4000-8000-000000000001', '60x120', 0),
  ('5bec0000-0000-4000-8000-00000000000e', 'a0000000-0000-4000-8000-000000000003', 'a7700000-0000-4000-8000-000000000002', 'Antiderrapante', 1),
  ('5bec0000-0000-4000-8000-00000000000f', 'a0000000-0000-4000-8000-000000000003', 'a7700000-0000-4000-8000-000000000003', 'Cinza', 2),
  ('5bec0000-0000-4000-8000-000000000010', 'a0000000-0000-4000-8000-000000000003', 'a7700000-0000-4000-8000-000000000005', '1,44', 3),
  ('5bec0000-0000-4000-8000-000000000011', 'a0000000-0000-4000-8000-000000000003', 'a7700000-0000-4000-8000-000000000006', 'Área externa', 4),
  ('5bec0000-0000-4000-8000-000000000012', 'a0000000-0000-4000-8000-000000000004', 'a7700000-0000-4000-8000-000000000001', '20x120', 0),
  ('5bec0000-0000-4000-8000-000000000013', 'a0000000-0000-4000-8000-000000000004', 'a7700000-0000-4000-8000-000000000002', 'Acetinado', 1),
  ('5bec0000-0000-4000-8000-000000000014', 'a0000000-0000-4000-8000-000000000004', 'a7700000-0000-4000-8000-000000000003', 'Madeira clara', 2),
  ('5bec0000-0000-4000-8000-000000000015', 'a0000000-0000-4000-8000-000000000004', 'a7700000-0000-4000-8000-000000000005', '1,20', 3),
  ('5bec0000-0000-4000-8000-000000000016', 'a0000000-0000-4000-8000-000000000004', 'a7700000-0000-4000-8000-000000000006', 'Piso interno', 4),
  ('5bec0000-0000-4000-8000-000000000017', 'a0000000-0000-4000-8000-000000000005', 'a7700000-0000-4000-8000-000000000001', '10x20', 0),
  ('5bec0000-0000-4000-8000-000000000018', 'a0000000-0000-4000-8000-000000000005', 'a7700000-0000-4000-8000-000000000002', 'Brilhante', 1),
  ('5bec0000-0000-4000-8000-000000000019', 'a0000000-0000-4000-8000-000000000005', 'a7700000-0000-4000-8000-000000000003', 'Branco', 2),
  ('5bec0000-0000-4000-8000-00000000001a', 'a0000000-0000-4000-8000-000000000005', 'a7700000-0000-4000-8000-000000000005', '1,00', 3),
  ('5bec0000-0000-4000-8000-00000000001b', 'a0000000-0000-4000-8000-000000000005', 'a7700000-0000-4000-8000-000000000006', 'Parede', 4),
  ('5bec0000-0000-4000-8000-00000000001c', 'a0000000-0000-4000-8000-000000000006', 'a7700000-0000-4000-8000-000000000001', '20x20', 0),
  ('5bec0000-0000-4000-8000-00000000001d', 'a0000000-0000-4000-8000-000000000006', 'a7700000-0000-4000-8000-000000000002', 'Acetinado', 1),
  ('5bec0000-0000-4000-8000-00000000001e', 'a0000000-0000-4000-8000-000000000006', 'a7700000-0000-4000-8000-000000000003', 'Estampado', 2),
  ('5bec0000-0000-4000-8000-00000000001f', 'a0000000-0000-4000-8000-000000000006', 'a7700000-0000-4000-8000-000000000006', 'Piso e parede', 3),
  ('5bec0000-0000-4000-8000-000000000020', 'a0000000-0000-4000-8000-000000000007', 'a7700000-0000-4000-8000-000000000003', 'Cinza', 0),
  ('5bec0000-0000-4000-8000-000000000021', 'a0000000-0000-4000-8000-000000000007', 'a7700000-0000-4000-8000-000000000007', 'Acrílico', 1),
  ('5bec0000-0000-4000-8000-000000000022', 'a0000000-0000-4000-8000-000000000007', 'a7700000-0000-4000-8000-000000000008', '1 kg', 2),
  ('5bec0000-0000-4000-8000-000000000023', 'a0000000-0000-4000-8000-000000000008', 'a7700000-0000-4000-8000-000000000007', 'CP II-E-32', 0),
  ('5bec0000-0000-4000-8000-000000000024', 'a0000000-0000-4000-8000-000000000008', 'a7700000-0000-4000-8000-000000000008', '50 kg', 1),
  ('5bec0000-0000-4000-8000-000000000025', 'a0000000-0000-4000-8000-000000000008', 'a7700000-0000-4000-8000-000000000006', 'Concreto e reboco', 2),
  ('5bec0000-0000-4000-8000-000000000026', 'a0000000-0000-4000-8000-000000000009', 'a7700000-0000-4000-8000-000000000007', 'AC-III', 0),
  ('5bec0000-0000-4000-8000-000000000027', 'a0000000-0000-4000-8000-000000000009', 'a7700000-0000-4000-8000-000000000008', '20 kg', 1),
  ('5bec0000-0000-4000-8000-000000000028', 'a0000000-0000-4000-8000-000000000009', 'a7700000-0000-4000-8000-000000000006', 'Porcelanato', 2),
  ('5bec0000-0000-4000-8000-000000000029', 'a0000000-0000-4000-8000-00000000000a', 'a7700000-0000-4000-8000-000000000007', 'Multiuso', 0),
  ('5bec0000-0000-4000-8000-00000000002a', 'a0000000-0000-4000-8000-00000000000a', 'a7700000-0000-4000-8000-000000000008', '20 kg', 1),
  ('5bec0000-0000-4000-8000-00000000002b', 'a0000000-0000-4000-8000-00000000000a', 'a7700000-0000-4000-8000-000000000006', 'Alvenaria', 2),
  ('5bec0000-0000-4000-8000-00000000002c', 'a0000000-0000-4000-8000-00000000000b', 'a7700000-0000-4000-8000-000000000001', '14x19x39', 0),
  ('5bec0000-0000-4000-8000-00000000002d', 'a0000000-0000-4000-8000-00000000000b', 'a7700000-0000-4000-8000-00000000000b', 'Concreto', 1),
  ('5bec0000-0000-4000-8000-00000000002e', 'a0000000-0000-4000-8000-00000000000c', 'a7700000-0000-4000-8000-000000000001', '9x19x19', 0),
  ('5bec0000-0000-4000-8000-00000000002f', 'a0000000-0000-4000-8000-00000000000c', 'a7700000-0000-4000-8000-00000000000b', 'Cerâmica', 1),
  ('5bec0000-0000-4000-8000-000000000030', 'a0000000-0000-4000-8000-00000000000d', 'a7700000-0000-4000-8000-000000000007', 'Bicomponente', 0),
  ('5bec0000-0000-4000-8000-000000000031', 'a0000000-0000-4000-8000-00000000000d', 'a7700000-0000-4000-8000-000000000008', '18 kg', 1),
  ('5bec0000-0000-4000-8000-000000000032', 'a0000000-0000-4000-8000-00000000000d', 'a7700000-0000-4000-8000-000000000006', 'Áreas molhadas', 2),
  ('5bec0000-0000-4000-8000-000000000033', 'a0000000-0000-4000-8000-00000000000e', 'a7700000-0000-4000-8000-000000000002', 'Fosco', 0),
  ('5bec0000-0000-4000-8000-000000000034', 'a0000000-0000-4000-8000-00000000000e', 'a7700000-0000-4000-8000-000000000009', '18 L', 1),
  ('5bec0000-0000-4000-8000-000000000035', 'a0000000-0000-4000-8000-00000000000e', 'a7700000-0000-4000-8000-00000000000a', 'Até 380 m²/demão', 2),
  ('5bec0000-0000-4000-8000-000000000036', 'a0000000-0000-4000-8000-00000000000e', 'a7700000-0000-4000-8000-000000000006', 'Interna e externa', 3),
  ('5bec0000-0000-4000-8000-000000000037', 'a0000000-0000-4000-8000-00000000000e', 'a7700000-0000-4000-8000-000000000003', 'Branco', 4),
  ('5bec0000-0000-4000-8000-000000000038', 'a0000000-0000-4000-8000-00000000000f', 'a7700000-0000-4000-8000-000000000002', 'Acetinado', 0),
  ('5bec0000-0000-4000-8000-000000000039', 'a0000000-0000-4000-8000-00000000000f', 'a7700000-0000-4000-8000-000000000009', '3,6 L', 1),
  ('5bec0000-0000-4000-8000-00000000003a', 'a0000000-0000-4000-8000-00000000000f', 'a7700000-0000-4000-8000-00000000000a', 'Até 70 m²/demão', 2),
  ('5bec0000-0000-4000-8000-00000000003b', 'a0000000-0000-4000-8000-00000000000f', 'a7700000-0000-4000-8000-000000000006', 'Interna', 3),
  ('5bec0000-0000-4000-8000-00000000003c', 'a0000000-0000-4000-8000-00000000000f', 'a7700000-0000-4000-8000-000000000003', 'Cinza', 4),
  ('5bec0000-0000-4000-8000-00000000003d', 'a0000000-0000-4000-8000-000000000010', 'a7700000-0000-4000-8000-000000000002', 'Fosco', 0),
  ('5bec0000-0000-4000-8000-00000000003e', 'a0000000-0000-4000-8000-000000000010', 'a7700000-0000-4000-8000-000000000009', '18 L', 1),
  ('5bec0000-0000-4000-8000-00000000003f', 'a0000000-0000-4000-8000-000000000010', 'a7700000-0000-4000-8000-000000000006', 'Externa', 2),
  ('5bec0000-0000-4000-8000-000000000040', 'a0000000-0000-4000-8000-000000000010', 'a7700000-0000-4000-8000-000000000003', 'Branco', 3),
  ('5bec0000-0000-4000-8000-000000000041', 'a0000000-0000-4000-8000-000000000011', 'a7700000-0000-4000-8000-00000000000b', 'Lã sintética', 0),
  ('5bec0000-0000-4000-8000-000000000042', 'a0000000-0000-4000-8000-000000000012', 'a7700000-0000-4000-8000-00000000000b', 'Cerdas gris', 0),
  ('5bec0000-0000-4000-8000-000000000043', 'a0000000-0000-4000-8000-000000000013', 'a7700000-0000-4000-8000-00000000000c', '2,5', 0),
  ('5bec0000-0000-4000-8000-000000000044', 'a0000000-0000-4000-8000-000000000013', 'a7700000-0000-4000-8000-00000000000d', '100 m', 1),
  ('5bec0000-0000-4000-8000-000000000045', 'a0000000-0000-4000-8000-000000000013', 'a7700000-0000-4000-8000-000000000003', 'Azul', 2),
  ('5bec0000-0000-4000-8000-000000000046', 'a0000000-0000-4000-8000-000000000014', 'a7700000-0000-4000-8000-000000000003', 'Branco', 0),
  ('5bec0000-0000-4000-8000-000000000047', 'a0000000-0000-4000-8000-000000000014', 'a7700000-0000-4000-8000-00000000000e', '10', 1),
  ('5bec0000-0000-4000-8000-000000000048', 'a0000000-0000-4000-8000-000000000014', 'a7700000-0000-4000-8000-00000000000b', 'Termoplástico', 2),
  ('5bec0000-0000-4000-8000-000000000049', 'a0000000-0000-4000-8000-000000000015', 'a7700000-0000-4000-8000-000000000003', 'Preto', 0),
  ('5bec0000-0000-4000-8000-00000000004a', 'a0000000-0000-4000-8000-000000000015', 'a7700000-0000-4000-8000-00000000000e', '10', 1),
  ('5bec0000-0000-4000-8000-00000000004b', 'a0000000-0000-4000-8000-000000000015', 'a7700000-0000-4000-8000-00000000000b', 'Termoplástico', 2),
  ('5bec0000-0000-4000-8000-00000000004c', 'a0000000-0000-4000-8000-000000000016', 'a7700000-0000-4000-8000-00000000000b', 'Alumínio', 0),
  ('5bec0000-0000-4000-8000-00000000004d', 'a0000000-0000-4000-8000-000000000016', 'a7700000-0000-4000-8000-000000000010', 'Bivolt', 1),
  ('5bec0000-0000-4000-8000-00000000004e', 'a0000000-0000-4000-8000-000000000016', 'a7700000-0000-4000-8000-000000000011', 'Conforme lâmpada', 2),
  ('5bec0000-0000-4000-8000-00000000004f', 'a0000000-0000-4000-8000-000000000017', 'a7700000-0000-4000-8000-00000000000f', '9', 0),
  ('5bec0000-0000-4000-8000-000000000050', 'a0000000-0000-4000-8000-000000000017', 'a7700000-0000-4000-8000-000000000010', 'Bivolt', 1),
  ('5bec0000-0000-4000-8000-000000000051', 'a0000000-0000-4000-8000-000000000017', 'a7700000-0000-4000-8000-000000000011', 'Branca fria', 2),
  ('5bec0000-0000-4000-8000-000000000052', 'a0000000-0000-4000-8000-000000000018', 'a7700000-0000-4000-8000-000000000012', '25 mm', 0),
  ('5bec0000-0000-4000-8000-000000000053', 'a0000000-0000-4000-8000-000000000018', 'a7700000-0000-4000-8000-00000000000d', '6 m', 1),
  ('5bec0000-0000-4000-8000-000000000054', 'a0000000-0000-4000-8000-000000000018', 'a7700000-0000-4000-8000-00000000000b', 'PVC', 2),
  ('5bec0000-0000-4000-8000-000000000055', 'a0000000-0000-4000-8000-000000000019', 'a7700000-0000-4000-8000-000000000012', '25 mm', 0),
  ('5bec0000-0000-4000-8000-000000000056', 'a0000000-0000-4000-8000-000000000019', 'a7700000-0000-4000-8000-00000000000b', 'PVC', 1),
  ('5bec0000-0000-4000-8000-000000000057', 'a0000000-0000-4000-8000-00000000001a', 'a7700000-0000-4000-8000-000000000012', '3/4"', 0),
  ('5bec0000-0000-4000-8000-000000000058', 'a0000000-0000-4000-8000-00000000001a', 'a7700000-0000-4000-8000-00000000000b', 'Latão', 1),
  ('5bec0000-0000-4000-8000-000000000059', 'a0000000-0000-4000-8000-00000000001a', 'a7700000-0000-4000-8000-000000000002', 'Bruto', 2),
  ('5bec0000-0000-4000-8000-00000000005a', 'a0000000-0000-4000-8000-00000000001b', 'a7700000-0000-4000-8000-00000000000f', '650', 0),
  ('5bec0000-0000-4000-8000-00000000005b', 'a0000000-0000-4000-8000-00000000001b', 'a7700000-0000-4000-8000-000000000010', '127 V', 1),
  ('5bec0000-0000-4000-8000-00000000005c', 'a0000000-0000-4000-8000-00000000001b', 'a7700000-0000-4000-8000-000000000013', '0–3000', 2),
  ('5bec0000-0000-4000-8000-00000000005d', 'a0000000-0000-4000-8000-00000000001c', 'a7700000-0000-4000-8000-00000000000f', '12 V', 0),
  ('5bec0000-0000-4000-8000-00000000005e', 'a0000000-0000-4000-8000-00000000001c', 'a7700000-0000-4000-8000-000000000010', 'Bivolt (carregador)', 1),
  ('5bec0000-0000-4000-8000-00000000005f', 'a0000000-0000-4000-8000-00000000001c', 'a7700000-0000-4000-8000-000000000013', '0–1300', 2),
  ('5bec0000-0000-4000-8000-000000000060', 'a0000000-0000-4000-8000-00000000001d', 'a7700000-0000-4000-8000-00000000000b', 'Aço forjado e fibra', 0),
  ('5bec0000-0000-4000-8000-000000000061', 'a0000000-0000-4000-8000-00000000001e', 'a7700000-0000-4000-8000-00000000000b', 'Cromo-vanádio', 0),
  ('5bec0000-0000-4000-8000-000000000062', 'a0000000-0000-4000-8000-00000000001f', 'a7700000-0000-4000-8000-00000000000b', 'Aço carbono', 0),
  ('5bec0000-0000-4000-8000-000000000063', 'a0000000-0000-4000-8000-000000000020', 'a7700000-0000-4000-8000-000000000003', 'Branco', 0),
  ('5bec0000-0000-4000-8000-000000000064', 'a0000000-0000-4000-8000-000000000020', 'a7700000-0000-4000-8000-00000000000b', 'Louça', 1),
  ('5bec0000-0000-4000-8000-000000000065', 'a0000000-0000-4000-8000-000000000020', 'a7700000-0000-4000-8000-000000000002', 'Brilhante', 2),
  ('5bec0000-0000-4000-8000-000000000066', 'a0000000-0000-4000-8000-000000000021', 'a7700000-0000-4000-8000-000000000003', 'Branco', 0),
  ('5bec0000-0000-4000-8000-000000000067', 'a0000000-0000-4000-8000-000000000021', 'a7700000-0000-4000-8000-00000000000b', 'Louça', 1),
  ('5bec0000-0000-4000-8000-000000000068', 'a0000000-0000-4000-8000-000000000022', 'a7700000-0000-4000-8000-000000000002', 'Preto fosco', 0),
  ('5bec0000-0000-4000-8000-000000000069', 'a0000000-0000-4000-8000-000000000022', 'a7700000-0000-4000-8000-00000000000b', 'Latão', 1),
  ('5bec0000-0000-4000-8000-00000000006a', 'a0000000-0000-4000-8000-000000000023', 'a7700000-0000-4000-8000-000000000002', 'Cromado', 0),
  ('5bec0000-0000-4000-8000-00000000006b', 'a0000000-0000-4000-8000-000000000023', 'a7700000-0000-4000-8000-00000000000b', 'Latão', 1),
  ('5bec0000-0000-4000-8000-00000000006c', 'a0000000-0000-4000-8000-000000000024', 'a7700000-0000-4000-8000-00000000000f', '7500', 0),
  ('5bec0000-0000-4000-8000-00000000006d', 'a0000000-0000-4000-8000-000000000024', 'a7700000-0000-4000-8000-000000000010', '220 V', 1),
  ('5bec0000-0000-4000-8000-00000000006e', 'a0000000-0000-4000-8000-000000000024', 'a7700000-0000-4000-8000-000000000002', 'Branco', 2),
  ('5bec0000-0000-4000-8000-00000000006f', 'a0000000-0000-4000-8000-000000000025', 'a7700000-0000-4000-8000-00000000000b', 'Aço inox 304', 0),
  ('5bec0000-0000-4000-8000-000000000070', 'a0000000-0000-4000-8000-000000000025', 'a7700000-0000-4000-8000-000000000002', 'Escovado', 1),
  ('5bec0000-0000-4000-8000-000000000071', 'a0000000-0000-4000-8000-000000000025', 'a7700000-0000-4000-8000-000000000001', '60x40', 2),
  ('5bec0000-0000-4000-8000-000000000072', 'a0000000-0000-4000-8000-000000000026', 'a7700000-0000-4000-8000-000000000002', 'Inox escovado', 0),
  ('5bec0000-0000-4000-8000-000000000073', 'a0000000-0000-4000-8000-000000000026', 'a7700000-0000-4000-8000-00000000000b', 'Latão', 1),
  ('5bec0000-0000-4000-8000-000000000074', 'a0000000-0000-4000-8000-000000000027', 'a7700000-0000-4000-8000-000000000002', 'Cromado', 0),
  ('5bec0000-0000-4000-8000-000000000075', 'a0000000-0000-4000-8000-000000000027', 'a7700000-0000-4000-8000-00000000000b', 'Latão', 1);


insert into public.product_tags (product_id, tag_id) values
  ('a0000000-0000-4000-8000-000000000001', '7a900000-0000-4000-8000-00000000001c'),
  ('a0000000-0000-4000-8000-000000000001', '7a900000-0000-4000-8000-000000000020'),
  ('a0000000-0000-4000-8000-000000000001', '7a900000-0000-4000-8000-000000000013'),
  ('a0000000-0000-4000-8000-000000000002', '7a900000-0000-4000-8000-000000000013'),
  ('a0000000-0000-4000-8000-000000000002', '7a900000-0000-4000-8000-000000000020'),
  ('a0000000-0000-4000-8000-000000000003', '7a900000-0000-4000-8000-000000000004'),
  ('a0000000-0000-4000-8000-000000000003', '7a900000-0000-4000-8000-000000000009'),
  ('a0000000-0000-4000-8000-000000000004', '7a900000-0000-4000-8000-000000000003'),
  ('a0000000-0000-4000-8000-000000000004', '7a900000-0000-4000-8000-000000000020'),
  ('a0000000-0000-4000-8000-000000000005', '7a900000-0000-4000-8000-000000000021'),
  ('a0000000-0000-4000-8000-000000000006', '7a900000-0000-4000-8000-00000000000e'),
  ('a0000000-0000-4000-8000-000000000007', '7a900000-0000-4000-8000-00000000001f'),
  ('a0000000-0000-4000-8000-000000000008', '7a900000-0000-4000-8000-000000000008'),
  ('a0000000-0000-4000-8000-000000000008', '7a900000-0000-4000-8000-00000000000f'),
  ('a0000000-0000-4000-8000-000000000009', '7a900000-0000-4000-8000-000000000005'),
  ('a0000000-0000-4000-8000-00000000000a', '7a900000-0000-4000-8000-000000000005'),
  ('a0000000-0000-4000-8000-00000000000b', '7a900000-0000-4000-8000-00000000000f'),
  ('a0000000-0000-4000-8000-00000000000b', '7a900000-0000-4000-8000-000000000002'),
  ('a0000000-0000-4000-8000-00000000000c', '7a900000-0000-4000-8000-000000000002'),
  ('a0000000-0000-4000-8000-00000000000d', '7a900000-0000-4000-8000-000000000016'),
  ('a0000000-0000-4000-8000-00000000000e', '7a900000-0000-4000-8000-00000000001d'),
  ('a0000000-0000-4000-8000-00000000000e', '7a900000-0000-4000-8000-000000000001'),
  ('a0000000-0000-4000-8000-00000000000f', '7a900000-0000-4000-8000-00000000001d'),
  ('a0000000-0000-4000-8000-00000000000f', '7a900000-0000-4000-8000-00000000001a'),
  ('a0000000-0000-4000-8000-000000000010', '7a900000-0000-4000-8000-00000000001d'),
  ('a0000000-0000-4000-8000-000000000010', '7a900000-0000-4000-8000-000000000010'),
  ('a0000000-0000-4000-8000-000000000011', '7a900000-0000-4000-8000-00000000001d'),
  ('a0000000-0000-4000-8000-000000000012', '7a900000-0000-4000-8000-00000000001d'),
  ('a0000000-0000-4000-8000-000000000013', '7a900000-0000-4000-8000-00000000000d'),
  ('a0000000-0000-4000-8000-000000000013', '7a900000-0000-4000-8000-000000000012'),
  ('a0000000-0000-4000-8000-000000000014', '7a900000-0000-4000-8000-00000000000d'),
  ('a0000000-0000-4000-8000-000000000015', '7a900000-0000-4000-8000-00000000000d'),
  ('a0000000-0000-4000-8000-000000000015', '7a900000-0000-4000-8000-00000000000b'),
  ('a0000000-0000-4000-8000-000000000016', '7a900000-0000-4000-8000-000000000015'),
  ('a0000000-0000-4000-8000-000000000016', '7a900000-0000-4000-8000-000000000017'),
  ('a0000000-0000-4000-8000-000000000017', '7a900000-0000-4000-8000-000000000015'),
  ('a0000000-0000-4000-8000-000000000017', '7a900000-0000-4000-8000-00000000001b'),
  ('a0000000-0000-4000-8000-000000000018', '7a900000-0000-4000-8000-000000000014'),
  ('a0000000-0000-4000-8000-000000000018', '7a900000-0000-4000-8000-00000000001e'),
  ('a0000000-0000-4000-8000-000000000019', '7a900000-0000-4000-8000-000000000014'),
  ('a0000000-0000-4000-8000-000000000019', '7a900000-0000-4000-8000-00000000001e'),
  ('a0000000-0000-4000-8000-00000000001a', '7a900000-0000-4000-8000-000000000014'),
  ('a0000000-0000-4000-8000-00000000001b', '7a900000-0000-4000-8000-000000000011'),
  ('a0000000-0000-4000-8000-00000000001c', '7a900000-0000-4000-8000-000000000011'),
  ('a0000000-0000-4000-8000-00000000001c', '7a900000-0000-4000-8000-000000000007'),
  ('a0000000-0000-4000-8000-00000000001d', '7a900000-0000-4000-8000-000000000011'),
  ('a0000000-0000-4000-8000-00000000001e', '7a900000-0000-4000-8000-000000000011'),
  ('a0000000-0000-4000-8000-00000000001f', '7a900000-0000-4000-8000-000000000011'),
  ('a0000000-0000-4000-8000-00000000001f', '7a900000-0000-4000-8000-000000000019'),
  ('a0000000-0000-4000-8000-000000000020', '7a900000-0000-4000-8000-000000000006'),
  ('a0000000-0000-4000-8000-000000000021', '7a900000-0000-4000-8000-000000000006'),
  ('a0000000-0000-4000-8000-000000000021', '7a900000-0000-4000-8000-00000000000c'),
  ('a0000000-0000-4000-8000-000000000022', '7a900000-0000-4000-8000-000000000006'),
  ('a0000000-0000-4000-8000-000000000022', '7a900000-0000-4000-8000-00000000000b'),
  ('a0000000-0000-4000-8000-000000000023', '7a900000-0000-4000-8000-000000000006'),
  ('a0000000-0000-4000-8000-000000000024', '7a900000-0000-4000-8000-000000000006'),
  ('a0000000-0000-4000-8000-000000000025', '7a900000-0000-4000-8000-00000000000a'),
  ('a0000000-0000-4000-8000-000000000025', '7a900000-0000-4000-8000-000000000018'),
  ('a0000000-0000-4000-8000-000000000026', '7a900000-0000-4000-8000-00000000000a'),
  ('a0000000-0000-4000-8000-000000000027', '7a900000-0000-4000-8000-00000000000a');


insert into public.product_environments (product_id, environment_id) values
  ('a0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000003'),
  ('a0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000004'),
  ('a0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000002'),
  ('a0000000-0000-4000-8000-000000000002', 'e0000000-0000-4000-8000-000000000003'),
  ('a0000000-0000-4000-8000-000000000003', 'e0000000-0000-4000-8000-000000000005'),
  ('a0000000-0000-4000-8000-000000000003', 'e0000000-0000-4000-8000-000000000007'),
  ('a0000000-0000-4000-8000-000000000004', 'e0000000-0000-4000-8000-000000000004'),
  ('a0000000-0000-4000-8000-000000000004', 'e0000000-0000-4000-8000-000000000003'),
  ('a0000000-0000-4000-8000-000000000005', 'e0000000-0000-4000-8000-000000000002'),
  ('a0000000-0000-4000-8000-000000000005', 'e0000000-0000-4000-8000-000000000001'),
  ('a0000000-0000-4000-8000-000000000005', 'e0000000-0000-4000-8000-000000000006'),
  ('a0000000-0000-4000-8000-000000000006', 'e0000000-0000-4000-8000-000000000002'),
  ('a0000000-0000-4000-8000-000000000006', 'e0000000-0000-4000-8000-000000000001'),
  ('a0000000-0000-4000-8000-00000000000d', 'e0000000-0000-4000-8000-000000000001'),
  ('a0000000-0000-4000-8000-00000000000d', 'e0000000-0000-4000-8000-000000000006'),
  ('a0000000-0000-4000-8000-00000000000e', 'e0000000-0000-4000-8000-000000000003'),
  ('a0000000-0000-4000-8000-00000000000e', 'e0000000-0000-4000-8000-000000000004'),
  ('a0000000-0000-4000-8000-00000000000e', 'e0000000-0000-4000-8000-000000000005'),
  ('a0000000-0000-4000-8000-00000000000f', 'e0000000-0000-4000-8000-000000000004'),
  ('a0000000-0000-4000-8000-00000000000f', 'e0000000-0000-4000-8000-000000000002'),
  ('a0000000-0000-4000-8000-000000000010', 'e0000000-0000-4000-8000-000000000005'),
  ('a0000000-0000-4000-8000-000000000016', 'e0000000-0000-4000-8000-000000000002'),
  ('a0000000-0000-4000-8000-000000000016', 'e0000000-0000-4000-8000-000000000003'),
  ('a0000000-0000-4000-8000-000000000016', 'e0000000-0000-4000-8000-000000000007'),
  ('a0000000-0000-4000-8000-000000000020', 'e0000000-0000-4000-8000-000000000001'),
  ('a0000000-0000-4000-8000-000000000021', 'e0000000-0000-4000-8000-000000000001'),
  ('a0000000-0000-4000-8000-000000000022', 'e0000000-0000-4000-8000-000000000001'),
  ('a0000000-0000-4000-8000-000000000023', 'e0000000-0000-4000-8000-000000000001'),
  ('a0000000-0000-4000-8000-000000000024', 'e0000000-0000-4000-8000-000000000001'),
  ('a0000000-0000-4000-8000-000000000025', 'e0000000-0000-4000-8000-000000000002'),
  ('a0000000-0000-4000-8000-000000000025', 'e0000000-0000-4000-8000-000000000007'),
  ('a0000000-0000-4000-8000-000000000026', 'e0000000-0000-4000-8000-000000000002'),
  ('a0000000-0000-4000-8000-000000000026', 'e0000000-0000-4000-8000-000000000007'),
  ('a0000000-0000-4000-8000-000000000027', 'e0000000-0000-4000-8000-000000000002'),
  ('a0000000-0000-4000-8000-000000000027', 'e0000000-0000-4000-8000-000000000006');


insert into public.product_relations (product_id, related_product_id, relation_type, sort_order) values
  ('a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000009', 'combines', 0),
  ('a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000007', 'combines', 1),
  ('a0000000-0000-4000-8000-00000000000e', 'a0000000-0000-4000-8000-000000000011', 'combines', 0),
  ('a0000000-0000-4000-8000-00000000000e', 'a0000000-0000-4000-8000-000000000012', 'combines', 1),
  ('a0000000-0000-4000-8000-000000000020', 'a0000000-0000-4000-8000-000000000022', 'combines', 0),
  ('a0000000-0000-4000-8000-000000000025', 'a0000000-0000-4000-8000-000000000026', 'combines', 0);


insert into public.collections (id, name, slug, title, subtitle, source, sort_order, max_items) values
  ('c0110000-0000-4000-8000-000000000001', 'Destaques da Home', 'destaques', 'Produtos em destaque', 'Seleção da equipe para quem está construindo ou reformando.', 'featured', 0, 8),
  ('c0110000-0000-4000-8000-000000000002', 'Ofertas da Home', 'ofertas-home', 'Ofertas da Cerigatto', 'Condições especiais por tempo limitado. Consulte disponibilidade.', 'on_sale', 1, 8),
  ('c0110000-0000-4000-8000-000000000003', 'Mais procurados', 'mais-procurados', 'Mais procurados', 'Os itens mais consultados no site e as recomendações da equipe.', 'most_viewed', 2, 8),
  ('c0110000-0000-4000-8000-000000000004', 'Lançamentos', 'lancamentos', 'Novidades no catálogo', null, 'new', 3, 8);


insert into public.banners (id, internal_name, placement, desktop_image_url, mobile_image_url, image_alt, eyebrow, title, subtitle, button_text, button_url, text_position, overlay_opacity, sort_order) values
  ('ba000000-0000-4000-8000-000000000001', 'Hero — obra completa (demo)', 'home_hero', 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=2400&q=80', 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&h=1200&w=900&q=80', 'Equipe trabalhando em canteiro de obras', 'Materiais de construção em Bauru', 'Do alicerce ao acabamento, em um só lugar.', 'Encontre o material certo para cada etapa e consulte disponibilidade direto com nossa equipe pelo WhatsApp.', 'Ver departamentos', '/produtos', 'left', 55, 0),
  ('ba000000-0000-4000-8000-000000000002', 'Hero — pisos (demo)', 'home_hero', 'https://images.unsplash.com/photo-1706629503586-2731f65587ae?auto=format&fit=crop&w=2400&q=80', 'https://images.unsplash.com/photo-1706629503586-2731f65587ae?auto=format&fit=crop&h=1200&w=900&q=80', 'Ambiente amplo com piso de porcelanato marmorizado', 'Pisos e revestimentos', 'Grandes formatos para ambientes que respiram.', 'Porcelanatos acetinados, polidos e técnicos para cada ambiente da casa.', 'Explorar porcelanatos', '/categoria/porcelanatos', 'left', 45, 1),
  ('ba000000-0000-4000-8000-000000000003', 'Hero — banheiro (demo)', 'home_hero', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=2400&q=80', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&h=1200&w=900&q=80', 'Banheiro moderno com chuveiro e lavatório', 'Banheiro', 'Metais e louças que fazem diferença no dia a dia.', 'Misturadores, cubas e chuveiros para reformar sem complicação.', 'Ver produtos para banheiro', '/categoria/banheiro', 'left', 50, 2),
  ('ba000000-0000-4000-8000-000000000004', 'Faixa intermediária — tintas (demo)', 'home_middle', 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=2400&q=80', 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&h=1200&w=900&q=80', 'Pintura de parede com rolo', 'Tintas', 'Cor nova sem errar na quantidade.', 'Diga a metragem das paredes e nossa equipe ajuda a calcular quantas latas você precisa.', 'Ver tintas', '/categoria/tintas', 'left', 50, 3),
  ('ba000000-0000-4000-8000-000000000005', 'Especialistas (demo)', 'home_specialist', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=2400&q=80', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&h=1200&w=900&q=80', 'Pessoa desenhando projeto arquitetônico', 'Atendimento', 'Mande a lista da sua obra. A gente organiza o orçamento.', 'Monte sua Lista de Orçamento no site ou envie fotos e medidas pelo WhatsApp.', 'Falar com um especialista', '/contato', 'left', 60, 4);


insert into public.blog_categories (id, name, slug, sort_order) values
  ('b1c00000-0000-4000-8000-000000000001', 'Construção', 'construcao', 0),
  ('b1c00000-0000-4000-8000-000000000002', 'Reforma', 'reforma', 1),
  ('b1c00000-0000-4000-8000-000000000003', 'Pisos', 'pisos', 2),
  ('b1c00000-0000-4000-8000-000000000004', 'Tintas', 'tintas', 3),
  ('b1c00000-0000-4000-8000-000000000005', 'Hidráulica', 'hidraulica', 4),
  ('b1c00000-0000-4000-8000-000000000006', 'Elétrica', 'eletrica', 5),
  ('b1c00000-0000-4000-8000-000000000007', 'Decoração', 'decoracao', 6),
  ('b1c00000-0000-4000-8000-000000000008', 'Ferramentas', 'ferramentas', 7),
  ('b1c00000-0000-4000-8000-000000000009', 'Manutenção', 'manutencao', 8);


insert into public.blog_posts (id, title, slug, excerpt, content, cover_image_url, cover_alt, author_name, category_id, status, published_at, is_featured, reading_minutes) values
  ('b1000000-0000-4000-8000-000000000001', 'Como calcular a quantidade de piso para a sua obra', 'como-calcular-a-quantidade-de-piso', 'Uma conta simples evita sobra cara ou falta no meio do assentamento. Veja como medir e quanto de margem considerar.', '## 1. Meça a área do ambiente

Multiplique o comprimento pela largura de cada cômodo. Em ambientes em L, divida em retângulos e some as áreas.

## 2. Some a margem de perda

- **Assentamento reto:** acrescente cerca de 10%.
- **Diagonal ou espinha de peixe:** considere de 15% a 20%.
- **Grandes formatos:** a perda em recortes costuma ser maior.

## 3. Converta para caixas

Divida a área total (já com a margem) pela metragem de cada caixa, informada na embalagem, e arredonde sempre para cima.

> Exemplo: sala de 4 m × 5 m = 20 m². Com 10% de margem, 22 m². Se a caixa tem 1,62 m², são 13,6 → **14 caixas**.

## 4. Compre tudo do mesmo lote

Peças de lotes diferentes podem ter variação de tonalidade. Por isso, vale comprar a quantidade total de uma vez e guardar algumas peças para manutenção futura.

Na dúvida, envie as medidas pelo WhatsApp que nossa equipe ajuda na conta.', 'https://images.unsplash.com/photo-1600328604921-300918f36018?auto=format&fit=crop&w=1600&q=80', 'Piso cerâmico em tons de bege e marrom', 'Equipe editorial (demonstração)', 'b1c00000-0000-4000-8000-000000000003', 'published', now() - interval '5 days', true, 4),
  ('b1000000-0000-4000-8000-000000000002', 'Fosco, acetinado ou semibrilho: qual acabamento de tinta escolher?', 'fosco-acetinado-ou-semibrilho', 'O acabamento muda a aparência e a facilidade de limpeza da parede. Entenda as diferenças antes de comprar.', '## Fosco

Disfarça imperfeições e dá um visual elegante. É a escolha mais comum para tetos e salas, mas costuma ser menos resistente à limpeza.

## Acetinado

Tem um leve brilho e é mais fácil de limpar. Funciona bem em quartos, corredores e cozinhas.

## Semibrilho

Mais resistente à umidade e à limpeza frequente, indicado para portas, rodapés e áreas de muito uso. Evidencia mais as imperfeições da parede.

## Dica

Antes de pintar, corrija trincas e aplique selador em paredes novas. A preparação da superfície influencia tanto quanto a tinta escolhida.', 'https://images.unsplash.com/photo-1456086272160-b28b0645b729?auto=format&fit=crop&w=1600&q=80', 'Latas de tinta de várias cores', 'Equipe editorial (demonstração)', 'b1c00000-0000-4000-8000-000000000004', 'published', now() - interval '12 days', false, 5),
  ('b1000000-0000-4000-8000-000000000003', 'Qual bitola de fio usar em cada circuito da casa?', 'qual-bitola-de-fio-usar', 'Iluminação, tomadas e chuveiro pedem bitolas diferentes. Veja uma referência geral e por que contratar um eletricista.', 'Esta é apenas uma referência geral. O dimensionamento correto depende da distância, da carga e do projeto elétrico, e deve ser feito por um profissional habilitado seguindo a NBR 5410.

## Referências comuns em residências

| Circuito | Bitola usual |
| --- | --- |
| Iluminação | 1,5 mm² |
| Tomadas de uso geral | 2,5 mm² |
| Tomadas de cozinha e lavanderia | 2,5 mm² a 4 mm² |
| Chuveiro elétrico | 6 mm² a 10 mm² |

## Cores dos condutores

Use azul-claro para o neutro e verde ou verde-amarelo para o terra. Isso facilita manutenções futuras.

## Segurança em primeiro lugar

Nunca aumente o disjuntor sem verificar a bitola do fio. Disjuntor maior que o suportado pelo cabo pode causar aquecimento e incêndio.', 'https://images.unsplash.com/photo-1601462904263-f2fa0c851cb9?auto=format&fit=crop&w=1600&q=80', 'Fios elétricos coloridos', 'Equipe editorial (demonstração)', 'b1c00000-0000-4000-8000-000000000006', 'published', now() - interval '20 days', false, 4),
  ('b1000000-0000-4000-8000-000000000004', 'Checklist para reformar o banheiro sem dor de cabeça', 'checklist-para-reformar-o-banheiro', 'Da impermeabilização à escolha do metal: a ordem certa das etapas para não refazer serviço.', '## 1. Planeje os pontos de água e esgoto

Defina a posição do vaso, do lavatório e do chuveiro antes de quebrar qualquer parede.

## 2. Impermeabilize a área do box

Aplique impermeabilizante no piso e subindo pelas paredes do box. Faça o teste de estanqueidade antes de revestir.

## 3. Escolha revestimentos adequados

Prefira pisos com acabamento acetinado ou antiderrapante na área molhada.

## 4. Compatibilize registros e acabamentos

O acabamento do registro precisa ser compatível com a base instalada na parede. Anote a marca e a linha.

## 5. Deixe os metais e louças por último

Instale após o rejunte e a limpeza da obra, evitando riscos e manchas.', 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1600&q=80', 'Banheiro com banheira branca e planta', 'Equipe editorial (demonstração)', 'b1c00000-0000-4000-8000-000000000002', 'published', now() - interval '33 days', false, 6);


insert into public.blog_post_products (post_id, product_id, sort_order) values
  ('b1000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 0),
  ('b1000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000009', 1),
  ('b1000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000007', 2),
  ('b1000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-00000000000e', 0),
  ('b1000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-00000000000f', 1),
  ('b1000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000011', 2),
  ('b1000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000013', 0),
  ('b1000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000014', 1),
  ('b1000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000024', 2),
  ('b1000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-00000000000d', 0),
  ('b1000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000022', 1),
  ('b1000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000020', 2);


insert into public.faqs (id, question, answer, sort_order) values
  ('fa900000-0000-4000-8000-000000000001', 'Posso comprar pelo site?', 'O site é um catálogo. Você encontra os produtos, monta sua Lista de Orçamento e envia para nossa equipe pelo WhatsApp, que confirma disponibilidade, valores e condições.', 0),
  ('fa900000-0000-4000-8000-000000000002', 'Os preços exibidos são finais?', 'Quando aparecem, os preços são informativos. Valores finais, descontos por quantidade e condições são confirmados no atendimento.', 1),
  ('fa900000-0000-4000-8000-000000000003', 'Como funciona a Lista de Orçamento?', 'Adicione produtos, escolha variações e quantidades e toque em "Enviar lista pelo WhatsApp". A lista fica salva no seu navegador até você limpá-la.', 2);


-- Liga a faixa de aviso de conteúdo de demonstração

update public.site_settings set demo_notice_enabled = true, tagline = 'Materiais de construção em Bauru/SP' where id = 1;
