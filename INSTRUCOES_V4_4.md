# Forcas 4.4 · Correcoes e evolucao

## Correcoes
- Fim de semana sem notificacao: filtro de dias uteis aplicado ao lembrete interno e REMOCAO do canal antigo de "melhor esforco" do Android, que disparava fora de hora (era ele o provavel emissor de sabado/domingo).
- Zerar agora apaga somente check-ins e historico. Ajustes, token, tema e progresso do livro sao preservados.
- Campo do token travado apos salvar; botao Alterar (com confirmacao) destrava.

## Novidades (roteiro 4.3 + 4.4)
- Icone redesenhado no padrao One UI (squircle, gradientes, sombra suave).
- Lembrete de backup mensal: card discreto em Hoje apos 30 dias sem exportar.
- Aviso automatico se a assinatura push deste aparelho mudar (reinstalacao/limpeza), com atalho para regenerar.
- Relatorio PDF com layout premium (cabecalho, cartoes de KPI, barras por forca, zebra).
- Transicao suave entre capitulos do livro.
- Reserva interna dos dados em IndexedDB: se o Android limpar o armazenamento leve do Chrome, o app se restaura sozinho da reserva.
- Historico paginado (60 registros por vez) e renderizacao sob demanda por aba: app mais leve com anos de uso.

## Instalacao
1. GitHub: substituir index.html, sw.js e os TRES icones (icon-192.png, icon-512.png, icon-maskable-512.png).
2. Celular: fechar e abrir o app 2 vezes; conferir "Forcas 4.4" em Ajustes > Sobre.
3. Em Ajustes > Avisos com o app fechado, toque em "Enviar" (Sincronizar horarios) uma vez, para garantir que o horarios.json do repositorio esta com seus horarios e diasUteis corretos.
4. Icone novo: o Android atualiza o pacote sozinho em 1 a 3 dias. Para ver na hora: desinstalar o icone e reinstalar pelo Chrome (dados preservados; nao limpar o Chrome).

## Token do GitHub (novo, ja que o anterior foi apagado)
1. GitHub > foto de perfil > Settings > Developer settings > Personal access tokens > Fine-grained tokens > Generate new token.
2. Nome: forcas-app. Expiration: 1 ano (ou custom).
3. Repository access: Only select repositories > selecione o repositorio do app.
4. Permissions > Repository permissions > Contents: Read and write. (Nada mais.)
5. Generate token > copie o codigo github_pat_... > cole no campo do app. Ele salva e trava sozinho.
6. Higiene: na mesma tela do GitHub, delete o token antigo (forcas-app anterior), ja que ele continua valido no servidor.
