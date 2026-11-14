export type Lang = "en" | "fr";
export type Localized = Record<Lang, string>;
// url: project page opened from the card
// aliases: other spellings that show the same card (e.g. the French word order "crypter runtime")
export type Entry = Localized & { url: string; aliases?: string[] };

// Matching is case-sensitive: the key and every alias must match the text exactly.
export const GLOSSARY: Record<string, Entry> = {
	// languages
	"C": {
		url: "https://en.cppreference.com/w/c",
		en: "General-purpose low-level language created in the early 1970s, used for operating systems and embedded software.",
		fr: "Langage bas niveau polyvalent créé au début des années 1970, utilisé pour les systèmes d'exploitation et l'embarqué.",
	},
	"C++": {
		url: "https://isocpp.org",
		en: "Extension of C with classes, templates and a large standard library, used where performance matters, like games and browsers.",
		fr: "Extension du C avec classes, templates et une grande bibliothèque standard, utilisée là où la performance compte, comme les jeux et les navigateurs.",
	},
	"JS": {
		aliases: ["JavaScript"],
		url: "https://developer.mozilla.org/docs/Web/JavaScript",
		en: "The scripting language of the web, running in browsers and on servers through Node.js.",
		fr: "Le langage de script du web, qui s'exécute dans les navigateurs et sur les serveurs via Node.js.",
	},
	"TS": {
		aliases: ["TypeScript"],
		url: "https://www.typescriptlang.org",
		en: "JavaScript with static types, compiled down to plain JavaScript.",
		fr: "JavaScript avec des types statiques, compilé en JavaScript classique.",
	},
	"Shell": {
		url: "https://www.gnu.org/software/bash/",
		en: "Command-line interpreters like bash and sh, and the scripts written for them to automate tasks.",
		fr: "Interpréteurs de commandes comme bash et sh, et les scripts écrits pour automatiser des tâches.",
	},
	"Python": {
		url: "https://www.python.org",
		en: "Readable high-level language, widely used for scripting, automation, data and security tooling.",
		fr: "Langage de haut niveau lisible, très utilisé pour le script, l'automatisation, les données et les outils de sécurité.",
	},
	"GNU Make": {
		url: "https://www.gnu.org/software/make/",
		en: "Build tool that reads a Makefile to rebuild only what changed in a project.",
		fr: "Outil de build qui lit un Makefile pour ne recompiler que ce qui a changé.",
	},

	// reversing
	"Ghidra": {
		url: "https://ghidra-sre.org",
		en: "Open-source reverse engineering suite released by the NSA, with a disassembler and decompiler to analyze compiled programs.",
		fr: "Suite de reverse engineering open source publiée par la NSA, avec désassembleur et décompilateur pour analyser des programmes compilés.",
	},
	"Radare2": {
		url: "https://github.com/radareorg/radare2",
		en: "Open-source command-line reverse engineering framework to disassemble, debug and patch binaries.",
		fr: "Framework de reverse engineering open source en ligne de commande pour désassembler, déboguer et patcher des binaires.",
	},
	"JADX": {
		url: "https://github.com/skylot/jadx",
		en: "Decompiler that turns Android APK and DEX files back into readable Java code.",
		fr: "Décompilateur qui retransforme les fichiers APK et DEX Android en code Java lisible.",
	},

	// systems
	"Linux": {
		url: "https://www.kernel.org",
		en: "Open-source operating system kernel at the core of most servers, Android and countless distributions.",
		fr: "Noyau de système d'exploitation open source au coeur de la plupart des serveurs, d'Android et de nombreuses distributions.",
	},
	"NGINX": {
		url: "https://nginx.org",
		en: "Fast web server and reverse proxy, also used as a load balancer.",
		fr: "Serveur web et reverse proxy rapide, aussi utilisé comme répartiteur de charge.",
	},
	"Docker": {
		url: "https://www.docker.com",
		en: "Packages an application and its dependencies into containers so it runs the same everywhere.",
		fr: "Empaquette une application et ses dépendances dans des conteneurs pour qu'elle s'exécute partout de la même façon.",
	},
	"Git": {
		url: "https://git-scm.com",
		en: "Distributed version control system that tracks changes to source code.",
		fr: "Système de gestion de versions distribué qui suit les modifications du code source.",
	},
	"AppArmor": {
		url: "https://apparmor.net",
		en: "Linux security module that confines programs with per-application profiles.",
		fr: "Module de sécurité Linux qui confine les programmes avec des profils par application.",
	},

	// databases
	"MongoDB": {
		url: "https://www.mongodb.com",
		en: "Document-oriented NoSQL database that stores data as JSON-like documents.",
		fr: "Base de données NoSQL orientée documents, qui stocke les données sous forme de documents de type JSON.",
	},
	"PostgreSQL": {
		url: "https://www.postgresql.org",
		en: "Open-source relational database known for standards compliance and advanced features.",
		fr: "Base de données relationnelle open source réputée pour sa conformité aux standards et ses fonctionnalités avancées.",
	},
	"MariaDB": {
		url: "https://mariadb.org",
		en: "Open-source relational database forked from MySQL.",
		fr: "Base de données relationnelle open source issue d'un fork de MySQL.",
	},
	"Redis": {
		url: "https://redis.io",
		en: "In-memory key-value store used for caching, queues and fast lookups.",
		fr: "Base clé-valeur en mémoire, utilisée pour le cache, les files d'attente et les accès rapides.",
	},

	// security
	"nmap": {
		url: "https://nmap.org",
		en: "Network scanner that discovers hosts and open ports and detects the services running on them.",
		fr: "Scanner réseau qui découvre les machines et les ports ouverts, et détecte les services qui y tournent.",
	},
	"Hashcat": {
		url: "https://hashcat.net/hashcat/",
		en: "Fast password recovery tool that cracks hashes using CPU and GPU power.",
		fr: "Outil rapide de récupération de mots de passe qui casse des hashes en utilisant le CPU et le GPU.",
	},
	"Burp Suite": {
		url: "https://portswigger.net/burp",
		en: "Web security testing toolkit built around an intercepting proxy, used to inspect and modify HTTP traffic.",
		fr: "Boîte à outils de test de sécurité web, centrée sur un proxy d'interception pour inspecter et modifier le trafic HTTP.",
	},
	"Wireshark": {
		url: "https://www.wireshark.org",
		en: "Network protocol analyzer that captures and inspects packets in detail.",
		fr: "Analyseur de protocoles réseau qui capture et inspecte les paquets en détail.",
	},

	// protocols
	"TCP": {
		url: "https://www.rfc-editor.org/rfc/rfc9293",
		en: "Reliable, connection-oriented transport protocol: ordered delivery with retransmission of lost data.",
		fr: "Protocole de transport fiable orienté connexion : livraison dans l'ordre avec retransmission des données perdues.",
	},
	"UDP": {
		url: "https://www.rfc-editor.org/rfc/rfc768",
		en: "Lightweight, connectionless transport protocol with no delivery guarantee, used where speed matters.",
		fr: "Protocole de transport léger sans connexion et sans garantie de livraison, utilisé quand la vitesse prime.",
	},
	"SSH": {
		url: "https://www.openssh.com",
		en: "Protocol for secure remote login and encrypted file transfer over untrusted networks.",
		fr: "Protocole de connexion à distance sécurisée et de transfert de fichiers chiffré sur des réseaux non fiables.",
	},
	"FTP": {
		url: "https://www.rfc-editor.org/rfc/rfc959",
		en: "Old protocol for transferring files between hosts; it sends data and credentials unencrypted.",
		fr: "Ancien protocole de transfert de fichiers entre machines ; il envoie données et identifiants en clair.",
	},
	"DNS": {
		url: "https://www.rfc-editor.org/rfc/rfc1035",
		en: "System that translates domain names into IP addresses.",
		fr: "Système qui traduit les noms de domaine en adresses IP.",
	},
	"ASM x86-x64": {
		aliases: ["ASM"],
		url: "https://en.wikipedia.org/wiki/X86_assembly_language",
		en: "Assembly language of x86 processors, the human-readable form of machine code.",
		fr: "Langage d'assemblage des processeurs x86, la forme lisible du code machine.",
	},
	"Windows": {
		url: "https://www.microsoft.com/windows",
		en: "Microsoft's operating system, the dominant desktop platform.",
		fr: "Système d'exploitation de Microsoft, la plateforme de bureau dominante.",
	},
	"Rust": {
		url: "https://www.rust-lang.org",
		en: "Systems language that guarantees memory safety without a garbage collector.",
		fr: "Langage système qui garantit la sécurité mémoire sans garbage collector.",
	},
	"Go": {
		url: "https://go.dev",
		en: "Go is a simple, efficient programming language developed by Google, known for its clean syntax, concurrency (goroutines) and static typing, used for building scalable applications.",
		fr: "Go est un langage simple et efficace développé par Google, connu pour sa syntaxe claire, sa gestion de la concurrence (goroutines) et son typage statique, utilisé pour construire des applications évolutives.",
	},

	// words used in the text of the page
	"42": {
		url: "https://42.fr",
		en: "Tuition-free programming school with no teachers: students learn through projects and by helping each other.",
		fr: "École de programmation gratuite et sans professeurs : on apprend par projets et en s'entraidant.",
	},
	"42 common core": {
		url: "https://42.fr",
		aliases: ["tronc commun de 42", "42 core curriculum", "42 Common Core"],
		en: "The mandatory first part of the 42 curriculum: a series of projects done through peer learning.",
		fr: "La première partie obligatoire du cursus de 42 : une série de projets réalisés en apprentissage entre pairs.",
	},
	"cryptography": {
		aliases: ["cryptographie", "Cryptography", "Cryptographie"],
		url: "https://en.wikipedia.org/wiki/Cryptography",
		en: "The science of securing information with mathematics: encryption, hashing and signatures keep data confidential, intact and authentic.",
		fr: "La science qui protège l'information grâce aux mathématiques : chiffrement, hachage et signatures garantissent la confidentialité, l'intégrité et l'authenticité des données.",
	},
	"piscine": {
		aliases: ["Piscine"],
		url: "https://42.fr",
		en: "The intensive selection bootcamp of 42, about a month long: candidates learn to code through daily projects and peer evaluation.",
		fr: "La période de sélection intensive de 42, d'environ un mois : les candidats apprennent à coder par des projets quotidiens et l'évaluation par les pairs.",
	},
	"LLM": {
		url: "https://en.wikipedia.org/wiki/Large_language_model",
		en: "Large Language Model: an AI model trained on huge amounts of text, able to read, summarize and generate text.",
		fr: "Large Language Model (grand modèle de langage) : un modèle d'IA entraîné sur d'énormes quantités de texte, capable de lire, résumer et générer du texte.",
	},
	"Django": {
		url: "https://www.djangoproject.com",
		en: "High-level Python web framework that comes with an ORM, authentication and an admin interface.",
		fr: "Framework web Python de haut niveau fourni avec un ORM, l'authentification et une interface d'administration.",
	},
	"Adminer": {
		url: "https://www.adminer.org",
		en: "Lightweight database management tool delivered as a single PHP file and used from a web browser.",
		fr: "Outil léger de gestion de bases de données, fourni dans un seul fichier PHP et utilisable depuis un navigateur web.",
	},
	"La Suite numérique": {
		url: "https://lasuite.numerique.gouv.fr",
		en: "Suite of open-source collaborative tools built for the French public administration, including Docs and Drive.",
		fr: "Suite d'outils collaboratifs open source conçue pour l'administration française, dont Docs et Drive.",
	},
	"DINUM": {
		url: "https://www.numerique.gouv.fr/dinum/",
		en: "The French interministerial digital directorate, in charge of the State's digital strategy.",
		fr: "La Direction interministérielle du numérique, chargée de la stratégie numérique de l'État.",
	},
	"LZ4": {
		url: "https://lz4.org",
		en: "Very fast lossless compression algorithm: it favors speed over compression ratio and decompresses extremely quickly.",
		fr: "Algorithme de compression sans perte très rapide : il privilégie la vitesse au taux de compression et décompresse extrêmement vite.",
	},
	"AES-256": {
		url: "https://en.wikipedia.org/wiki/Advanced_Encryption_Standard",
		en: "AES with a 256-bit key: the symmetric block cipher standardized by NIST and widely used to encrypt data.",
		fr: "AES avec une clé de 256 bits : le chiffrement symétrique par blocs standardisé par le NIST, très utilisé pour chiffrer des données.",
	},
	"runtime crypter": {
		aliases: ["crypter runtime"],
		url: "https://www.malwarebytes.com/blog/news/2015/12/malware-crypters-the-deceptive-first-layer",
		en: "A runtime crypter is a tool that protects executed code by encrypting it to prevent static analysis and unauthorized access.",
		fr: "Un crypter runtime est un outil qui protège le code exécuté en le chiffrant afin d'empêcher l'analyse statique et l'accès non autorisé. Le déchiffrement et la décompression du runtime crypter se font pendant l'exécution du programme, en mémoire.",
	},
	"Low-level development": {
		aliases: ["développement bas niveau"],
		url: "https://en.wikipedia.org/wiki/Low-level_programming_language",
		en: "Programming close to the hardware: managing memory manually, working with pointers and understanding how code maps to the CPU and memory, instead of relying on the abstractions of a high-level language.",
		fr: "Programmation proche du matériel : gestion manuelle de la mémoire, manipulation de pointeurs et compréhension de la façon dont le code se traduit au niveau du processeur et de la mémoire, plutôt que de s'appuyer sur les abstractions d'un langage haut niveau.",
	},
	"reverse engineering": {
		aliases: ["rétro-ingénierie"],
		url: "https://www.geeksforgeeks.org/software-engineering/software-engineering-reverse-engineering",
		en: "Software reverse engineering is the process of analyzing compiled software to deduce its original design and functionality.",
		fr: "La rétro-ingénierie est le processus d'analyse d'un logiciel compilé pour en déduire la conception et le fonctionnement d'origine.",
	},
	"ELF": {
		url: "https://en.wikipedia.org/wiki/Executable_and_Linkable_Format",
		en: "Executable and Linkable Format: the standard file format of executables, libraries and object files on Linux and Unix systems.",
		fr: "Executable and Linkable Format : le format de fichier standard des exécutables, bibliothèques et fichiers objets sous Linux et Unix.",
	},
	"wiper": {
		url: "https://www.crowdstrike.com/en-us/cybersecurity-101/malware/wiper-attack/",
		en: "A wiper is malicious software designed to delete or destroy data on a system, rendering it inaccessible or unrecoverable.",
		fr: "Un wiper est un logiciel malveillant conçu pour effacer ou détruire les données sur un système, les rendant inaccessibles ou irrécupérables.",
	},
	"Penetration testing": {
		aliases: ["pentest"],
		url: "https://www.ibm.com/think/topics/penetration-testing",
		en: "Penetration testing is a systematic process of identifying and exploiting vulnerabilities in a system to assess its security posture.",
		fr: "Le pentest est un processus systématique d'identification et d'exploitation de faiblesses dans un système pour évaluer son état de sécurité.",
	},
	"Bash": {
		url: "https://www.ibm.com/think/topics/penetration-testing",
		en: "Bash is a powerful shell scripting language used on Unix-based systems for both interactive command execution and automation tasks.", // TO CHANGE
		fr: "Bash est un langage de script shell puissant, utilisé sur les systèmes Unix aussi bien pour l'exécution interactive de commandes que pour l'automatisation de tâches.",
	},
	"interactive command interpreter": {
		aliases: ["interpréteur de commandes interactif"],
		url: "https://www.ibm.com/think/topics/penetration-testing",
		en: "An interactive command interpreter is a tool that allows users to input and execute commands in real-time, providing immediate feedback and results.", // TO CHANGE
		fr: "Un interpréteur de commandes interactif est un outil qui permet aux utilisateurs de saisir et d'exécuter des commandes en temps réel, fournissant un retour immédiat et des résultats.",
	},
	"TUI": {
		aliases: ["interface utilisateur en mode texte (TUI)", "text user interface (TUI)"],
		url: "https://en.wikipedia.org/wiki/Text-based_user_interface",
		en: "An interactive interface drawn in a terminal with text characters instead of graphics.",
		fr: "Une interface interactive dessinée dans un terminal avec des caractères plutôt que des graphiques.",
	},
	"ncurses": {
		url: "https://en.wikipedia.org/wiki/Ncurses",
		en: "C library that makes it easy and quick to build text-based user interfaces (TUIs).",
		fr: "Bibliothèque C permettant de créer facilement et rapidement des interfaces utilisateur en mode texte (TUI).",
	},
	"WordPress": {
		url: "https://wordpress.com/website-builder/",
		en: "WordPress is a web content management system (CMS) that makes it easy to create and manage sites such as blogs.",
		fr: "WordPress est un système de gestion de contenu web (CMS) permettant de créer et de gérer facilement des sites comme des blogs.",
	},
	"reverse proxy": {
		url: "https://www.cloudflare.com/learning/cdn/glossary/reverse-proxy/",
		en: "Server placed in front of one or more web servers, receiving client requests and forwarding them to the right backend server.",
		fr: "Serveur placé devant un ou plusieurs serveurs web, qui reçoit les requêtes des clients et les redirige vers le bon serveur en arrière-plan.",
	},
	"frontend": {
		url: "https://en.wikipedia.org/wiki/Front-end_web_development",
		en: "The part of a website or application that the user sees and interacts with: the pages, the buttons, the menus and their appearance.",
		fr: "Partie d'un site ou d'une application que l'utilisateur voit et avec laquelle il interagit : les pages, les boutons, les menus et leur apparence.",
	},
	"backend": {
		url: "https://www.geeksforgeeks.org/blogs/backend-development/",
		en: "The invisible part of a website or application that works behind the scenes. It handles requests, applies business rules and communicates with the database.",
		fr: "Partie invisible d'un site ou d'une application qui travaille en coulisses. Elle traite les demandes, applique les règles métier et échange avec la base de données.",
	},
	"base de données": {
		aliases: ["databases", "database"],
		url: "https://www.geeksforgeeks.org/blogs/backend-development/",
		en: "A place where software stores information in an organized way, so that data can be added, removed, modified or viewed simply and from a central location.",
		fr: "Endroit où un logiciel stocke des informations de façon organisée, afin de pouvoir ajouter, supprimer, modifier ou consulter ces données simplement et de façon centralisée.",
	},
	"librairie externe": {
		aliases: ["external library", "bibliothèque externe"],
		url: "https://www.geeksforgeeks.org/blogs/backend-development/",
		en: "A file that contains a set of functions meant to be reused in other projects.",
		fr: "Fichier qui contient un ensemble de fonctions à réutiliser dans d'autres projets.",
	},
	"accès anonyme": {
		aliases: ["anonymous access"],
		url: "https://www.geeksforgeeks.org/blogs/backend-development/",
		en: "On many FTP servers, an option can be enabled to allow or disallow logging in to the \"anonymous\" account, giving access to the files present on the server without needing to create a guest account yourself.",
		fr: "Sur de nombreux serveurs FTP, il est possible d'activer une option qui autorise ou non la connexion au compte « anonymous », donnant accès aux fichiers présents sur le serveur sans qu'il soit nécessaire de créer soi-même un compte invité.",
	},
	"IRC": {
		url: "https://www.rfc-editor.org/rfc/rfc2812",
		en: "Internet Relay Chat: a text chat protocol where clients join channels hosted on servers.",
		fr: "Internet Relay Chat : un protocole de discussion textuelle où les clients rejoignent des salons hébergés sur des serveurs.",
	},
	"raycasting": {
		url: "https://en.wikipedia.org/wiki/Ray_casting",
		en: "Rendering technique that casts one ray per screen column to find the nearest wall, used by early 3D games like Wolfenstein 3D.",
		fr: "Technique de rendu qui lance un rayon par colonne d'écran pour trouver le mur le plus proche, utilisée par les premiers jeux 3D comme Wolfenstein 3D.",
	},
	"microservices": {
		url: "https://en.wikipedia.org/wiki/Microservices",
		en: "Architecture that splits an application into small independent services communicating over the network.",
		fr: "Architecture qui découpe une application en petits services indépendants qui communiquent par le réseau.",
	},
	"libc": {
		url: "https://www.gnu.org/software/libc/",
		en: "The C standard library: basic functions like printf, malloc and string handling.",
		fr: "La bibliothèque standard du C : fonctions de base comme printf, malloc et la gestion des chaînes.",
	},

	// web
	"HTML": {
		url: "https://developer.mozilla.org/docs/Web/HTML",
		en: "The markup language that structures the content of every web page.",
		fr: "Le langage de balisage qui structure le contenu de chaque page web.",
	},
	"CSS": {
		url: "https://developer.mozilla.org/docs/Web/CSS",
		en: "The styling language that controls how HTML content looks: layout, colors, fonts and more.",
		fr: "Le langage de style qui contrôle l'apparence du contenu HTML : mise en page, couleurs, polices et plus encore.",
	},
	"TailwindCSS": {
		url: "https://tailwindcss.com",
		en: "Utility-first CSS framework: styles elements by combining small, single-purpose classes directly in the markup.",
		fr: "Framework CSS « utility-first » : il permet de styliser les éléments en combinant de petites classes à usage unique directement dans le balisage.",
	},
	"React": {
		url: "https://react.dev",
		en: "JavaScript library for building user interfaces out of reusable components.",
		fr: "Bibliothèque JavaScript pour construire des interfaces utilisateur à partir de composants réutilisables.",
	},
	"Bun": {
		url: "https://bun.sh",
		en: "Fast all-in-one JavaScript runtime, bundler and package manager, used here as this site's server.",
		fr: "Runtime, bundler et gestionnaire de paquets JavaScript rapide et tout-en-un, utilisé ici comme serveur de ce site.",
	},
	"ExpressJS": {
		url: "https://expressjs.com",
		en: "Minimal web framework for Node.js, used to build APIs and backend servers in JavaScript/TypeScript.",
		fr: "Framework web minimaliste pour Node.js, utilisé pour construire des API et des serveurs backend en JavaScript/TypeScript.",
	},
	"JWT": {
		url: "https://jwt.io",
		en: "JSON Web Token: a compact, signed token format used to carry authentication and session data between a client and a server.",
		fr: "JSON Web Token : un format de jeton compact et signé, utilisé pour transporter des données d'authentification et de session entre un client et un serveur.",
	},
	"WebSockets": {
		url: "https://developer.mozilla.org/docs/Web/API/WebSockets_API",
		en: "Protocol that keeps a persistent, two-way connection open between a client and a server, used for real-time updates like chat or live games.",
		fr: "Protocole qui maintient une connexion persistante et bidirectionnelle entre un client et un serveur, utilisé pour le temps réel comme le chat ou les jeux en direct.",
	},
	"Docker Compose": {
		url: "https://docs.docker.com/compose/",
		en: "Tool that defines and runs multi-container Docker applications from a single YAML file.",
		fr: "Outil qui définit et démarre des applications Docker multi-conteneurs à partir d'un seul fichier YAML.",
	},
	"PHP-FPM": {
		url: "https://www.php.net/manual/en/install.fpm.php",
		en: "FastCGI Process Manager for PHP: runs and manages PHP processes efficiently behind a web server like NGINX.",
		fr: "FastCGI Process Manager pour PHP : exécute et gère efficacement les processus PHP derrière un serveur web comme NGINX.",
	},
	"TLS": {
		url: "https://www.cloudflare.com/learning/ssl/transport-layer-security-tls/",
		en: "Transport Layer Security: the cryptographic protocol that encrypts and authenticates connections, for example HTTPS.",
		fr: "Transport Layer Security : le protocole cryptographique qui chiffre et authentifie les connexions, par exemple HTTPS.",
	},
	"Cloudflare": {
		url: "https://www.cloudflare.com",
		en: "CDN and security service that sits in front of a website, caching content, filtering malicious traffic and hiding the origin server.",
		fr: "Service de CDN et de sécurité placé devant un site web, qui met en cache le contenu, filtre le trafic malveillant et masque le serveur d'origine.",
	},

	// ops
	"DevOps": {
		url: "https://www.redhat.com/en/topics/devops/what-is-devops",
		en: "Set of practices that merges development and operations to ship and run software faster and more reliably.",
		fr: "Ensemble de pratiques qui rapproche développement et exploitation pour livrer et faire tourner des logiciels plus vite et plus fiablement.",
	},
	"DevSecOps": {
		url: "https://www.redhat.com/en/topics/devops/what-is-devsecops",
		en: "DevOps with security built into every stage of the pipeline, instead of being checked only at the end.",
		fr: "Le DevOps avec la sécurité intégrée à chaque étape du pipeline, plutôt que vérifiée seulement à la fin.",
	},
	"Proxmox": {
		url: "https://www.proxmox.com",
		en: "Open-source virtualization platform for running and managing virtual machines and containers on a server.",
		fr: "Plateforme de virtualisation open source pour exécuter et gérer des machines virtuelles et des conteneurs sur un serveur.",
	},
	"Jenkins": {
		url: "https://www.jenkins.io",
		en: "Open-source automation server that builds, tests and deploys software through CI/CD pipelines.",
		fr: "Serveur d'automatisation open source qui compile, teste et déploie des logiciels via des pipelines CI/CD.",
	},

	// homelab
	"Raspberry Pi": {
		url: "https://www.raspberrypi.com",
		en: "Low-cost, credit-card-sized single-board computer, often used for home servers, IoT and learning projects.",
		fr: "Ordinateur monocarte peu coûteux, de la taille d'une carte de crédit, souvent utilisé pour des serveurs personnels, l'IoT et l'apprentissage.",
	},
	"Alpine Linux": {
		url: "https://alpinelinux.org",
		en: "Minimal Linux distribution built around musl libc and BusyBox, popular as a small, security-focused base for containers.",
		fr: "Distribution Linux minimaliste basée sur musl libc et BusyBox, appréciée comme base légère et axée sur la sécurité pour les conteneurs.",
	},
	"Debian": {
		url: "https://www.debian.org",
		en: "Long-standing community-driven Linux distribution known for stability, and the base of many others like Ubuntu.",
		fr: "Distribution Linux communautaire de longue date, réputée pour sa stabilité, et à la base de nombreuses autres comme Ubuntu.",
	},
	"Pi-hole": {
		url: "https://pi-hole.net",
		en: "Network-wide ad and tracker blocker that works as a DNS sinkhole, usually self-hosted on a small device like a Raspberry Pi.",
		fr: "Bloqueur de publicités et de traqueurs à l'échelle du réseau, qui agit comme un DNS sinkhole, souvent auto-hébergé sur un petit appareil comme un Raspberry Pi.",
	},
	"Jellyfin": {
		url: "https://jellyfin.org",
		en: "Open-source, self-hosted media server for streaming your own movies, shows and music.",
		fr: "Serveur multimédia open source et auto-hébergé pour streamer ses propres films, séries et musiques.",
	},
	"Uptime Kuma": {
		url: "https://github.com/louislam/uptime-kuma",
		en: "Self-hosted monitoring tool that checks whether services and websites are up, with alerts and status pages.",
		fr: "Outil de monitoring auto-hébergé qui vérifie la disponibilité de services et de sites web, avec alertes et pages de statut.",
	},
	"Forgejo": {
		url: "https://forgejo.org",
		en: "Self-hosted, open-source Git server forked from Gitea, used to host repositories and code review outside GitHub.",
		fr: "Serveur Git open source et auto-hébergé, forké de Gitea, utilisé pour héberger des dépôts et faire de la revue de code en dehors de GitHub.",
	},
	"REMnux": {
		url: "https://remnux.org",
		en: "Linux distribution preloaded with tools for reverse-engineering and analyzing malware.",
		fr: "Distribution Linux préinstallée avec des outils pour la rétro-ingénierie et l'analyse de malwares.",
	},

	// networking
	"Unix socket": {
		aliases: ["Unix sockets", "sockets Unix", "socket Unix"],
		url: "https://man7.org/linux/man-pages/man7/unix.7.html",
		en: "Inter-process communication endpoint used to exchange data between processes, either on the same machine or over a network.",
		fr: "Point de communication inter-processus utilisé pour échanger des données entre processus, sur une même machine ou via le réseau.",
	},
	"escape sequence": {
		aliases: ["escape sequences"],
		url: "https://en.wikipedia.org/wiki/ANSI_escape_code",
		en: "A special sequence of characters sent to a terminal to control it, like moving the cursor or changing text color, instead of printing visible text.",
		fr: "Une suite spéciale de caractères envoyée à un terminal pour le piloter, comme déplacer le curseur ou changer la couleur du texte, plutôt que d'afficher du texte visible.",
	},
};
