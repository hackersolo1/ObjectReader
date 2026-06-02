# ObjectReader

## 📚 Visão Geral do Projeto

O **ObjectReader** é um sistema de inventário e gestão de ativos desenvolvido para o **Colégio Estadual Mathias Jacomel**. Sua principal finalidade é facilitar a catalogação, o controle e a localização de bens e equipamentos dentro da instituição, utilizando tecnologia de leitura de QR Code/código de barras para agilizar o processo. A aplicação permite que os usuários registrem, consultem, editem e excluam informações de ativos de forma eficiente, garantindo uma gestão patrimonial mais organizada e acessível.

## ✨ Funcionalidades Principais

*   **Leitura de QR Code/Código de Barras:** Utiliza a câmera do dispositivo para escanear e identificar ativos rapidamente.
*   **Gestão Completa de Ativos (CRUD):** Permite **C**riar, **R**eferenciar (visualizar), **U**pdate (editar) e **D**eletar informações de cada item.
*   **Detalhes do Ativo:** Armazena informações cruciais como nome, código de identificação, localização, estado de conservação, observações e uma imagem associada.
*   **Autenticação Segura:** Integração com autenticação via Google OAuth, garantindo que apenas usuários autorizados possam acessar e manipular os dados.
*   **Persistência de Dados:** Todos os dados e imagens são armazenados de forma segura e escalável utilizando o Supabase.
*   **Interface Responsiva:** Design adaptável para uso tanto em desktops quanto em dispositivos móveis, ideal para inventários em campo.

## 🚀 Tecnologias Utilizadas

O projeto foi construído com uma pilha de tecnologias web modernas e eficientes:

*   **HTML5:** Estrutura semântica e base da interface do usuário.
*   **CSS3:** Estilização e responsividade para uma experiência de usuário consistente.
*   **JavaScript:** Lógica de negócios, manipulação do DOM, integração com APIs e controle de fluxo da aplicação.
*   **Supabase:** Backend-as-a-Service (BaaS) para:
    *   **Autenticação (Auth):** Gerenciamento de usuários e login via Google.
    *   **Banco de Dados (PostgreSQL):** Armazenamento estruturado das informações dos ativos.
    *   **Armazenamento (Storage):** Hospedagem das imagens dos ativos.
*   **WebRTC (MediaDevices API):** Acesso à câmera do dispositivo para a funcionalidade de scanner.

## 🛠️ Como Executar Localmente

Para configurar e executar o **ObjectReader** em seu ambiente de desenvolvimento local, siga os passos abaixo:

1.  **Clone o Repositório:**
    ```bash
    git clone https://github.com/hackersolo1/ObjectReader.git
    cd ObjectReader/Front
    ```

2.  **Configuração do Supabase:**
    *   Crie um projeto no [Supabase](https://supabase.com/).
    *   Configure as tabelas e políticas de segurança (`RLS`) conforme a estrutura de dados do projeto (tabela `objects` com campos `name`, `code`, `local`, `state`, `obs`, `img_url`, `user_id`).
    *   Obtenha suas chaves `Anon Public` e `URL` do projeto Supabase.
    *   No arquivo `script.js`, atualize as variáveis `supabaseC` com suas credenciais:
        ```javascript
        const supabaseC = supabase.createClient(
            "SUA_URL_SUPABASE",
            "SUA_CHAVE_ANON_PUBLIC"
        );
        ```
    *   Configure a autenticação Google OAuth no Supabase e no Google Cloud Console.

3.  **Servidor Local:**
    Como a aplicação utiliza APIs de câmera e funcionalidades de backend, é recomendado executá-la através de um servidor web local. Você pode usar o Python para isso:
    ```bash
    python3 -m http.server 8000
    ```

4.  **Acesse no Navegador:**
    Abra seu navegador e acesse `http://localhost:8000`.

## 📂 Estrutura do Projeto

```
ObjectReader/
├── Front/                  # Contém os arquivos do frontend da aplicação
│   ├── index.html          # Página principal da interface do usuário
│   ├── style.css           # Estilos CSS da aplicação
│   └── script.js           # Lógica JavaScript principal (CRUD, Supabase, Scanner)
├── LICENSE                 # Arquivo de licença do projeto
└── README.md               # Este arquivo
```

## 🤝 Contribuição

Contribuições são bem-vindas! Se você tiver sugestões de melhoria, encontrar bugs ou quiser adicionar novas funcionalidades, sinta-se à vontade para abrir uma *issue* ou enviar um *pull request*.

## 📄 Licença

Este projeto está licenciado sob a [Licença MIT](LICENSE).
