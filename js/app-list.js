document.addEventListener("DOMContentLoaded", function () {
  const apps = [
    {
      name: "Zen Browser",
      link: "./zen",
      description:
        "'Welcome to a calmer internet' Beautifully designed, privacy-focused, and packed with features. We care about your experience, not your data.",
      iconUrl:
        "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/zen-browser.png",
      imageUrl: "/assets/img/articles//app-screenshots/zen.png",
      price: "free",
    },
    {
      name: "ProtectedText",
      link: "https://Protectedtext.com/",
      description:
        "Protected Text is a workspace for your notes. It is a Desinged so that can be used without an account just a url and password.",
      iconUrl:
        "./assets/img/PT.png",
      imageUrl: "/assets/img/articles//app-screenshots/notion.png",
      price: "free",
    },
    {
      name: "GlazeWM",
      link: "https://github.com/ianyh/Amethyst",
      description:
        "GlazeWM lets you easily organize windows and adjust their layout on the fly by using keyboard-driven commands..",
      iconUrl:
        "https://imgs.search.brave.com/Uy39kksISZ8Qi5JEha692LnVJGGJ8uPcOuV2YGT-d2s/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9naXRo/dWIuY29tL2Fzcm1h/Ny9HbGF6ZVdNX1dv/cmtzcGFjZXMtYXNy/bWE3L3Jhdy9tYWlu/L0ltYWdlcy9Mb2dv/LnBuZw",
      imageUrl: "https://github.com/glzr-io/glazewm/raw/main/resources/assets/demo.webp",
      price: "free",
    },
    {
      name: "VSCode",
      link: "https://code.visualstudio.com/",
      description:
        "You know it",
      iconUrl:
        "https://imgs.search.brave.com/7yIshSgFWorSSY4kDlD4asCTBVzCsV_Hf8_YRhWcRKg/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvY29tbW9ucy90/aHVtYi85LzlhL1Zp/c3VhbF9TdHVkaW9f/Q29kZV8xLjM1X2lj/b24uc3ZnLzI1MHB4/LVZpc3VhbF9TdHVk/aW9fQ29kZV8xLjM1/X2ljb24uc3ZnLnBu/Zw",
      imageUrl: "https://imgs.search.brave.com/Sskzg1aGDnAcV_BUeQYunMAJiAUQfhcL27ATl4Zcn0s/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9yYXcu/Z2l0aHVidXNlcmNv/bnRlbnQuY29tL3Zz/Y29kZS1pY29ucy92/c2NvZGUtaWNvbnMv/bWFzdGVyL2ltYWdl/cy9zY3JlZW5zaG90/LmdpZg.gif",
      price: "free",
    },
    {
      name: "Raycast",
      link: "https://www.raycast.com/",
      description:
        "A collection of powerful productivity tools all within an extendable launcher. Fast, ergonomic and reliable.",
      iconUrl:
        "https://upload.wikimedia.org/wikipedia/en/f/f4/Raycast_App_Icon.png",
      imageUrl: "/assets/img/articles//app-screenshots/raycast.png",
      price: "free",
    },
    {
      name: "Blip",
      link: "https://blip.net/",
      description:
        "Send any size file, right from your desktop via internet. A cross platform free to use app.",
      iconUrl: "https://imgs.search.brave.com/sGH2-CTeSPBPzAsIncGWzla6ZnzBr225lefr8ZXrXx4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9saDMu/Z29vZ2xldXNlcmNv/bnRlbnQuY29tLzU1/dzF4WjBacGVhRmtQ/d0IzUG1mQjcyYXZD/TnI3NGhEUXFUaU1n/QkQ2U0RCTlBwTDNW/T3lXNGxkX1NUY1oz/ZlVrYV94YjcwVXFM/a3h2dXJVSlZwTW4y/VlZheEthNWZndHk2/bEw9cnc",
      imageUrl: "https://imgs.search.brave.com/iYzmePgerAFy2bsh7NHYTTSgxHqU2uRzAMdTjugZgNQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/cG9kZmVldC5jb20v/YmxvZy93cC1jb250/ZW50L3VwbG9hZHMv/MjAyNS8wMi9CbGlw/LXNjcmVlbnNob3Qt/b24tTWFjLXNob3dp/bmctbXktZGV2aWNl/cy1hbmQtcGVvcGxl/LUktaGF2ZS1jb25u/ZWN0ZWQtd2l0aC0x/MDQweDUyMC0xLnBu/Zw",
      price: "free",
    },
    {
      name: "Proton VPN",
      link: "https://protonvpn.com//",
      description:
        "A Free VPN service that protects your privacy and security online. Unlimited bandwidth, high-speed servers, and strong encryption.",
      iconUrl: "https://imgs.search.brave.com/N6pt0pnxF_wF_gSwq4QA_yjzv2QBUpYDquw55X4Gih4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly91eHdp/bmcuY29tL3dwLWNv/bnRlbnQvdGhlbWVz/L3V4d2luZy9kb3du/bG9hZC9icmFuZHMt/YW5kLXNvY2lhbC1t/ZWRpYS9wcm90b24t/dnBuLWljb24ucG5n",
      imageUrl: "",
      price: "free",     },
    {
      name: "Wino Mail",
      link: "https://max.codes/latest/",
      description:
        "Blazingly fast mail client with super responsive modern UI for Windows.",
      iconUrl:
        "https://store-images.s-microsoft.com/image/apps.46082.13563003673252387.aa0aab37-1fc3-4cff-965d-326256200b2f.784318a4-3975-43cb-990a-3a9fea89c2ea?h=115",
      imageUrl: "/assets/img/articles//app-screenshots/latest.png",
      price: "free",
    },
    {
      name: "ChatGPT",
      link: "https://chat.openai.com/",
      description:
        "ChatGPT is an AI-powered chatbot developed by OpenAI, based on the GPT large language models. It is designed to engage in natural language conversations and provide human-like responses.",
      iconUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/1024px-ChatGPT_logo.svg.png",
      imageUrl: "https://miro.medium.com/v2/resize:fit:1080/0*uF3t_tl9eT_eIeF-.jpg",
      price: "free",
    } 
  ];

  const appsListContainer = document.getElementById("apps-list");

  apps.forEach((app) => {
    const card = document.createElement("a");
    // add the price as a class name to the card
    card.className = "card item " + app.price;
    card.href = app.link;

    const iconImg = document.createElement("img");
    iconImg.src = app.iconUrl;
    iconImg.alt = "";
    iconImg.className = "app-icon";

    const imageImg = document.createElement("img");
    imageImg.src = app.imageUrl;
    imageImg.alt = "";
    imageImg.className = "app-image";

    const cardHeader = document.createElement("div");
    cardHeader.className = "card-header";

    const name = document.createElement("h3");
    name.textContent = app.name;

    const cardBody = document.createElement("div");
    cardBody.className = "card-body";

    const description = document.createElement("p");
    description.textContent = app.description;

    cardHeader.appendChild(name);
    cardBody.appendChild(description);
    card.appendChild(iconImg);
    card.appendChild(imageImg);
    card.appendChild(cardHeader);
    card.appendChild(cardBody);

    appsListContainer.appendChild(card);
  });
});
