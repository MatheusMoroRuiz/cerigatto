-- =============================================================================
-- Páginas legais padrão (modelos). Revise com sua assessoria jurídica e edite
-- pelo painel em Conteúdo → Páginas. Não contêm dados inventados da empresa.
-- =============================================================================

insert into public.pages (slug, title, summary, content, status) values
  ('politica-de-privacidade', 'Política de Privacidade', 'Como tratamos os dados pessoais de quem visita o site e entra em contato com a Cerigatto.', 'Esta política explica quais dados pessoais são tratados quando você utiliza este site, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).

## Dados que coletamos

- **Formulário de contato:** nome, telefone/WhatsApp, e-mail, assunto e mensagem, informados por você.
- **Navegação:** registramos eventos anônimos (por exemplo, produtos visualizados e cliques no botão do WhatsApp) associados a um identificador de sessão aleatório, sem nome, e-mail ou telefone.
- **Lista de Orçamento e Favoritos:** ficam salvos apenas no seu navegador (armazenamento local) até você limpá-los.

## Para que usamos

- Responder às suas solicitações e orçamentos;
- Entender quais produtos e conteúdos são mais procurados, para melhorar o catálogo;
- Cumprir obrigações legais.

## WhatsApp

Ao clicar em um botão do WhatsApp, você é direcionado ao aplicativo e a conversa passa a seguir também as políticas do WhatsApp.

## Compartilhamento

Não vendemos dados pessoais. Os dados podem ser processados por fornecedores de infraestrutura (hospedagem e banco de dados) contratados para operar o site.

## Seus direitos

Você pode solicitar acesso, correção ou exclusão dos seus dados pessoais pelos canais informados na página de contato.

## Atualizações

Esta política pode ser atualizada. A data da última atualização aparece nesta página.', 'published'),
  ('termos-de-uso', 'Termos de Uso', 'Condições de uso do catálogo digital da Cerigatto.', '## Natureza do site

Este site é um **catálogo digital**. Não há venda, pagamento ou checkout on-line. Preços, quando exibidos, são informativos e podem mudar sem aviso; disponibilidade, condições e valores finais são confirmados pela nossa equipe no atendimento.

## Imagens e informações

As imagens são ilustrativas. Cores e texturas podem variar conforme a tela e o lote do fabricante. Confira as especificações técnicas com nossa equipe antes da compra.

## Lista de Orçamento

A Lista de Orçamento é uma ferramenta para organizar os itens que você quer cotar. Ela não gera pedido, reserva de produto nem compromisso de compra.

## Propriedade intelectual

Textos, marcas e elementos visuais do site não podem ser reproduzidos sem autorização.

## Contato

Dúvidas sobre estes termos podem ser enviadas pelos canais da página de contato.', 'published'),
  ('cookies', 'Política de Cookies', 'Quais tecnologias de armazenamento o site utiliza.', '## O que usamos

- **Armazenamento local do navegador:** guarda sua Lista de Orçamento, Favoritos e um identificador de sessão anônimo usado em estatísticas internas. Esses dados não identificam você.
- **Cookies de sessão administrativa:** usados apenas pela equipe da Cerigatto ao acessar o painel.

## Ferramentas de terceiros

Se ferramentas de medição (como Google Analytics ou Meta Pixel) forem ativadas, elas só serão carregadas após o seu consentimento no aviso de cookies, e você poderá alterar sua escolha a qualquer momento.

## Como apagar

Você pode limpar os dados do site nas configurações do seu navegador.', 'published')
on conflict (slug) do nothing;
