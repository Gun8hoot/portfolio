import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import type { Lang, Localized } from "./Glossary";
import { Term, TermProvider, renderTerms } from "./Term";
import { ProjectWindow } from "./ProjectWindow";
import type { ProjectWindowData } from "./ProjectWindow";
import { ContactForm } from "./ContactForm";
import { CopyToast, useCopyToast } from "./CopyToast";

// Each picture must be imported, not just referenced by path: Bun's bundler only
// discovers and serves an asset when it sees a real `import`, the same way it
// discovers index.css's fonts through `url(...)`. A plain string path here
// (e.g. picture: "../assets/logos/midona.svg") will 404, even if the file exists.
import midonaPicture from "../assets/images/logo/midona.svg";
import ctrl_tuiPreview from "../assets/images/preview/ctrl_tui.png";
import cube3dPreview from "../assets/images/preview/cube3d.gif";
import transcendencePreview from "../assets/images/preview/transcendence.gif";
import minishellPreview from "../assets/images/preview/minishell.gif";

type Profile = { label: string; href: string };
export type Project = {
	label: string;
	state: "finished" | "wip";
	status: "open" | "closed"; // open or closed source
	stack: string[]; // languages/tools used, shown as a grey field next to state/status
	shortDescription: Localized; // ~2 lines, shown under the project on the frontpage
	description: Localized; // longer and more precise, shown in the project window
	learned: Localized; // what you learned building it, shown in the project window
	picture: string; // path to the project's picture/image, shown in the project window
	href: string;
};
type SkillGroup = { label: Localized; items: string[] };
type Hackathon = {
	name: string;
	status: "open" | "closed"; // open or closed source, like a project
	stack: string[]; // shown in the project window
	picture: string; // shown in the project window (falls back to text only if the file is missing)
	learned?: Localized; // optional: the window simply has no "what I learned" part without it
	organizer: Localized;
	date: string; // start date as YYYY-MM-DD, shown in the visitor's language
	duration: Localized;
	location: Localized;
	position: Localized;
	link: string;
	description: Localized; // shown in the project window
};

// Every text that is not project or skill data.
const UI = {
	en: {
		titles: { description: "whoami", skills: "skills", projects: "projects", hackathons: "hackathons", links: "links", contact: "contact" },
		intro: `Hi, I'm Nathan "Gun8hoot" Clavel, a student at 42 Le Havre (France), aspiring to build a career in cybersecurity.`,
		story: [
			"I have been using computers since I was very young, but cybersecurity only really caught my attention when I came across videos and articles about the work of Bellingcat, an investigative journalism collective. The way they use OSINT in their research impressed me so much that I started digging into OSINT myself.",
			"From there I moved on to pentesting, then to low-level development and reverse engineering, and I have been falling deeper down the computer science rabbit hole ever since.",
		],
		searching: "I'm currently looking for an internship or apprenticeship in network/system administration, SOC analysis or DevOps/DevSecOps, between Paris and Le Havre.",
		ssh: "A terminal version of this portfolio is available. To access it, log in using: ssh portfolio@nathan.clavel.sh",
		states: { finished: "Finished", wip: "In progress" },
		statuses: { open: "Open source", closed: "Closed source" },
		hackathon: { organizer: "organized by", date: "date", duration: "duration", location: "location" },
		project: { description: "description", learned: "what I learned", viewRepo: "Go to repository", close: "Close", enlarge: "Enlarge the picture" },
		contact: {
			nameLabel: "Name",
			emailLabel: "Email",
			messageLabel: "Message",
			send: "Send",
			sending: "Sending…",
			success: "Message sent — thanks, I'll get back to you soon!",
			error: "Something went wrong. Please try again later.",
			captchaMissing: "Please complete the verification first.",
			captchaFailed: "The verification failed, please try again.",
			captchaUnavailable: "The verification could not be loaded. Check your connection or disable your content blocker, then reload the page.",
			invalid: "Please check the fields and try again.",
			e2ee: "Your message is forwarded to me end-to-end encrypted (E2EE) using the Matrix communication protocol.",
		},
	},
	fr: {
		titles: { description: "whoami", skills: "compétences", projects: "projets", hackathons: "hackathons", links: "liens", contact: "contact" },
		intro: `Bonjour, je suis Nathan « Gun8hoot » Clavel, étudiant à 42 Le Havre (France), avec pour ambition de faire carrière dans la cybersécurité.`,
		story: [
			"J'utilise des ordinateurs depuis tout petit, mais la cybersécurité ne m'a vraiment marqué qu'en tombant sur des vidéos et des articles sur le travail de Bellingcat, un collectif de journalisme d'investigation. La façon dont ils utilisent l'OSINT dans leurs recherches m'a tellement impressionné que je me suis mis à faire moi-même de nombreuses recherches sur l'OSINT.",
			"Je suis ensuite passé au pentest, puis au développement bas niveau et à la rétro-ingénierie, et je m'enfonce depuis toujours plus profondément dans l'informatique.",
		],
		searching: "Je suis actuellement à la recherche d'un stage ou d'une alternance en administration réseau/système, en analyse SOC ou en DevOps/DevSecOps, entre Paris et Le Havre.", // TO CREATE REDIRECTION
		ssh: "Une version « terminal » de ce portfolio est disponible. Pour y accéder, connectez-vous à l'aide de : ssh portfolio@nathan.clavel.sh",
		states: { finished: "Terminé", wip: "En cours" },
		statuses: { open: "Open source", closed: "Code fermé" },
		hackathon: { organizer: "organisé par", date: "date", duration: "durée", location: "lieu" },
		project: { description: "description", learned: "ce que j'ai appris", viewRepo: "Voir le dépôt", close: "Fermer", enlarge: "Agrandir l'image" },
		contact: {
			nameLabel: "Nom",
			emailLabel: "Email",
			messageLabel: "Message",
			send: "Envoyer",
			sending: "Envoi…",
			success: "Message envoyé — merci, je vous répondrai très bientôt !",
			error: "Une erreur est survenue, réessayez plus tard.",
			captchaMissing: "Merci de terminer d'abord la vérification.",
			captchaFailed: "La vérification a échoué, réessayez.",
			captchaUnavailable: "La vérification n'a pas pu être chargée. Vérifiez votre connexion ou désactivez votre bloqueur de contenu, puis rechargez la page.",
			invalid: "Merci de vérifier les champs et de réessayer.",
			e2ee: "Votre message m'est transmis chiffré de bout en bout (E2EE) via le protocole de communication Matrix.",
		},
	},
};

const PROFILES: Profile[] = [
	{ label: "LinkedIn", href: "https://www.linkedin.com/in/clavel-nathan" },
	{ label: "GitHub", href: "https://github.com/Gun8hoot" },
	{ label: "Root-Me", href: "https://www.root-me.org/Gun8hoot" },
	{ label: "HackTheBox", href: "https://app.hackthebox.com/public/users/1595967" },
	{ label: "TryHackMe", href: "https://tryhackme.com/p/Gun8hoot" },
	{ label: "CryptoHack", href: "https://cryptohack.org/user/Gun8hoot/" },
	{ label: "Email", href: "mailto:nathan.clavel@tutamail.com" },
];

// TODO: the remaining `picture` fields below are still plain string placeholders — they will
// 404 (and fall back to the full-width text layout) until you add the file under
// src/assets/logos/ AND `import` it at the top of this file like midonaPicture above.
const PROJECTS: Project[] = [
	{
		label: "Midona", state: "wip", status: "open",
		stack: ["C++", "ASM", "GNU Make"],
		shortDescription: {
			en: "A runtime crypter for ELF binaries that compresses them with LZ4 and encrypts them with AES-256.",
			fr: "Un crypter runtime pour binaires ELF, qui les compresse avec LZ4 et les chiffre en AES-256 avant leur exécution.",
		},
		description: {
			en: "Midona takes a Linux program and locks it up: it shrinks it, then encrypts it, like a password-protected zip file. When the program runs, it unlocks itself in memory only, without ever writing the unprotected version back to disk, which makes the program much harder to inspect or reverse-engineer.",
			fr: "Midona prend un programme Linux et le verrouille : il le compresse, puis le chiffre, comme un fichier zip protégé par mot de passe. Quand le programme s'exécute, il se déverrouille uniquement en mémoire, sans jamais réécrire la version déchiffrée sur le disque, ce qui le rend bien plus difficile à inspecter ou à rétro-ingénierer.",
		},
		learned: {
			en: "Implementing AES-256 and LZ4 myself gave me a solid understanding of how both algorithms work. Working directly with the executable also required a clear understanding of ELF structure and its components.",
			fr: "Implémenter moi-même AES-256 et LZ4 m'a permis de bien comprendre le fonctionnement de ces deux algorithmes. Travailler directement avec l'exécutable a aussi demandé une compréhension claire de la structure ELF et de ses composants.",
		},
		picture: midonaPicture,
		href: "https://github.com/Gun8hoot/Midona",
	},
	{
		// Assumption: marked "wip" since a homelab is an ongoing, continuously evolving setup
		// rather than something that's ever really "finished" — change if you'd rather call it done.
		label: "Homelab", state: "wip", status: "open",
		stack: ["Docker", "Linux", "Proxmox"],
		shortDescription: {
			en: "A two-node homelab for self-hosting and malware analysis: a Raspberry Pi running Docker services, and a Proxmox server for isolated analysis.",
			fr: "Un homelab à deux noeuds pour l'auto-hébergement et l'analyse de malwares : un Raspberry Pi avec des services Docker, et un serveur Proxmox pour l'analyse isolée.",
		},
		description: {
			en: "My homelab is made of two small computers with very different jobs. The first, a Raspberry Pi, hosts services I use every day: ad blocking, a media server, a monitoring dashboard and my own Git server. The second, running Proxmox, is a sealed-off lab where I can safely open and study malware inside virtual machines, fully cut off from the rest of my network so nothing can escape.",
			fr: "Mon homelab est composé de deux petits ordinateurs aux rôles bien distincts. Le premier, un Raspberry Pi, héberge des services que j'utilise au quotidien : blocage de publicités, serveur multimédia, tableau de bord de supervision et mon propre serveur Git. Le second, sous Proxmox, est un laboratoire isolé où je peux étudier des malwares en toute sécurité dans des machines virtuelles, complètement coupées du reste de mon réseau pour que rien ne puisse s'en échapper.",
		},
		learned: {
			en: "This project strengthened my network administration skills, including DNS configuration and port forwarding. It also taught me what is required to build and maintain a self-hosted infrastructure over time, including the proper configuration of each service. It was my first experience with Proxmox, and performance optimization was a significant part of the work.",
			fr: "Ce projet a renforcé mes compétences en administration réseau, notamment la configuration DNS et le port forwarding. Il m'a aussi appris ce qu'implique la construction et le maintien d'une infrastructure auto-hébergée dans la durée, notamment la configuration correcte de chaque service. Ce fut ma première expérience avec Proxmox, et l'optimisation des performances a représenté une part importante du travail.",
		},
		picture: "./assets/logos/homelab.svg",
		href: "https://github.com/gun8hoot/homelab",
	},
	{
		label: "Inception", state: "finished", status: "open",
		stack: ["Docker", "Shell", "GNU Make"],
		shortDescription: {
			en: "A Docker-based infrastructure for the 42 core curriculum: NGINX, WordPress, MariaDB, an FTP server, Adminer, Redis and Uptime Kuma, all running in containers.",
			fr: "Une infrastructure Docker pour le tronc commun de 42 : NGINX, WordPress, MariaDB, un serveur FTP, Adminer, Redis et Uptime Kuma, le tout dans des conteneurs.",
		},
		description: {
			en: "Inception is a solo 42 project where I built a small website's entire infrastructure from scratch, piece by piece, instead of using ready-made building blocks. A secure gateway sits in front, a WordPress site in the middle, and a database behind it, with a few extra tools to manage files, speed up pages and check that everything stays online. Every one of these pieces runs in its own isolated box, built by hand rather than downloaded ready-made.",
			fr: "Inception est un projet solo de 42 où j'ai construit de zéro, pièce par pièce, toute l'infrastructure d'un petit site web plutôt que d'utiliser des briques toutes prêtes. Une passerelle sécurisée se trouve devant, un site WordPress au milieu, et une base de données derrière, avec quelques outils en plus pour gérer les fichiers, accélérer les pages et vérifier que tout reste en ligne. Chacune de ces pièces tourne dans sa propre boîte isolée, construite à la main plutôt que téléchargée toute faite.",
		},
		learned: {
			en: "This was my first hands-on project with Docker, requiring a solid understanding of containers and how to build images from scratch. It was also my first experience configuring NGINX, MariaDB, PHP-FPM, an FTP server and Redis, and integrating them into a working stack.",
			fr: "Ce fut mon premier projet concret avec Docker, nécessitant une solide compréhension des conteneurs et de la construction d'images de zéro. Ce fut aussi ma première expérience de configuration de NGINX, MariaDB, PHP-FPM, d'un serveur FTP et de Redis, et de leur intégration au sein d'une stack fonctionnelle.",
		},
		picture: "./assets/logos/inception.svg",
		href: "https://github.com/Gun8hoot/42-Common-Core/tree/main/inception",
	},
	{
		label: "ft_transcendence", state: "finished", status: "open",
		stack: ["HTML", "CSS", "JavaScript", "TypeScript", "Shell", "Docker", "GNU Make"],
		shortDescription: {
			en: "The final 42 Common Core project: a multiplayer slither.io-style snake game with an MS-DOS/Windows 98 look.",
			fr: "Le projet final du tronc commun de 42 : un jeu de serpent multijoueur façon slither.io, à l'esthétique MS-DOS/Windows 98.",
		},
		description: {
			en: "ft_transcendence is the final group project of the 42 Common Core: a full web application built by a team, with its own frontend, backend and database kept separate and secured. We built a multiplayer snake game in the style of slither.io, dressed up to look like old MS-DOS and Windows 98 software. Players steer a growing snake and lose when they hit a wall or another player, live, with other people watching, a chat, and a history of past matches.",
			fr: "ft_transcendence est le projet de groupe final du tronc commun de 42 : une application web complète construite en équipe, avec son propre frontend, backend et base de données, séparés et sécurisés. Nous avons réalisé un jeu de serpent multijoueur façon slither.io, habillé pour ressembler à un vieux logiciel MS-DOS ou Windows 98. Les joueurs dirigent un serpent qui grandit et perdent en touchant un mur ou un autre joueur, en direct, avec d'autres personnes qui regardent, un chat, et un historique des parties jouées.",
		},
		learned: {
			en: "This project marked my first real experience with web development. I designed and built the infrastructure and backend, including the API and gateway, which required structuring the backend into reliable, communicating components.",
			fr: "Ce projet a marqué ma première véritable expérience du développement web. J'ai conçu et construit l'infrastructure et le backend, dont l'API et la gateway, ce qui a demandé de structurer le backend en composants fiables et communicants.",
		},
		picture: transcendencePreview,
		href: "https://github.com/banne227/ft_transcendence/",
	},
	{
		label: "CTRL-TUI", state: "wip", status: "open",
		stack: ["C++", "GNU Make"],
		shortDescription: {
			en: "A C++ program that creates a text user interface (TUI) window from scratch, with no dependency like ncurses.",
			fr: "Un programme C++ qui crée une fenêtre d'interface texte (TUI) de zéro, sans dépendance comme ncurses.",
		},
		description: {
			en: "CTRL-TUI builds the kind of text-based window you'd see in an old-school terminal program, entirely from scratch, without using any existing library to do the heavy lifting. It reads your keystrokes, decides what to draw and redraws the screen itself, giving full control over how the window looks and reacts.",
			fr: "CTRL-TUI construit, entièrement de zéro et sans utiliser aucune bibliothèque existante pour faire le gros du travail, le genre de fenêtre en mode texte qu'on verrait dans un vieux programme de terminal. Il lit lui-même les touches pressées, décide quoi afficher et réaffiche l'écran, offrant un contrôle total sur l'apparence de la fenêtre et sa réaction aux entrées.",
		},
		learned: {
			en: "This was my first large-scale project in C++. Building the interface without external dependencies required a solid understanding of how terminals operate through escape sequences, controlling both rendering and input handling.",
			fr: "Ce fut mon premier projet de grande envergure en C++. Construire l'interface sans dépendance externe a demandé une solide compréhension du fonctionnement des terminaux via les séquences d'échappement, avec le contrôle de l'affichage et de la gestion des entrées.",
		},
		picture: ctrl_tuiPreview,
		href: "https://github.com/Gun8hoot/CTRL-TUI",
	},
	{
		label: "Cube3D", state: "finished", status: "open",
		stack: ["C", "GNU Make"],
		shortDescription: {
			en: "A game from the 42 core curriculum, written in C, that renders a pseudo-3D maze in real time using raycasting.",
			fr: "Un jeu du tronc commun de 42, écrit en C, qui affiche un labyrinthe en pseudo-3D en temps réel grâce au raycasting.",
		},
		description: {
			en: "Cube3D is a group project from the 42 core curriculum: a game engine that makes a flat maze, described in a simple map file, look like a navigable 3D world, the same trick used by very early first-person games like Wolfenstein 3D. It works by shooting an imaginary ray straight ahead for every column of the screen to figure out what wall to draw and how far away it is, which is enough to fake depth and let you walk and turn around the maze in real time.",
			fr: "Cube3D est un projet de groupe du tronc commun de 42 : un moteur de jeu qui fait ressembler un labyrinthe plat, décrit dans un simple fichier de carte, à un monde 3D navigable, la même astuce utilisée par les tout premiers jeux en vue subjective comme Wolfenstein 3D. Il fonctionne en envoyant un rayon imaginaire tout droit pour chaque colonne de l'écran afin de déterminer quel mur dessiner et à quelle distance, ce qui suffit à simuler la profondeur et à se déplacer et tourner dans le labyrinthe en temps réel.",
		},
		learned: {
			en: "I implemented the complete map file parsing, door handling, a minimap with a field-of-view ray, and the weapon system. Achieving smooth performance also required focused optimization work.",
			fr: "J'ai implémenté l'intégralité du parsing du fichier de carte, la gestion des portes, une minimap avec un rayon de champ de vision, ainsi que le système d'arme. Obtenir une performance fluide a également demandé un travail d'optimisation ciblé.",
		},
		picture: cube3dPreview,
		href: "https://github.com/Gun8hoot/Cube3D",
	},
	{
		label: "Minishell", state: "finished", status: "open",
		stack: ["C", "GNU Make"],
		shortDescription: {
			en: "A group project rebuilding, in C, an interactive shell with parsing, pipes and redirections like Bash.",
			fr: "Un projet de groupe recréant, en C, un shell interactif avec parsing, pipes et redirections comme Bash.",
		},
		description: {
			en: "Minishell is a group project from the 42 core curriculum: we rebuilt, from nothing, a program close to Bash, the terminal you'd type commands into on a Linux computer. It reads what you type, understands commands, runs them, chains them together with pipes, and reacts to things like Ctrl+C, all without reusing any existing shell's code.",
			fr: "Minishell est un projet de groupe du tronc commun de 42 : nous avons recréé, à partir de rien, un programme proche de Bash, le terminal dans lequel on tape des commandes sur un ordinateur Linux. Il lit ce qu'on tape, comprend les commandes, les exécute, les enchaîne avec des pipes, et réagit à des choses comme Ctrl+C, sans réutiliser le code d'aucun shell existant.",
		},
		learned: {
			en: "This project gave me a solid understanding of how a shell like Bash works internally: reading input, processing it, and executing it. I also learned to use Unix pipes through the pipe() system call wrapper in C. The project represented commands using an AST (abstract syntax tree), which was my first practical exposure to binary trees.",
			fr: "Ce projet m'a donné une solide compréhension du fonctionnement interne d'un shell comme Bash : la lecture de l'entrée, son traitement, puis son exécution. J'ai aussi appris à utiliser les pipes Unix via le wrapper d'appel système pipe() en C. Le projet représentait les commandes à l'aide d'un AST (arbre syntaxique abstrait), ce qui a constitué ma première exposition pratique aux arbres binaires.",
		},
		picture: minishellPreview,
		href: "https://github.com/thlibers/minishell",
	},
	{
		label: "PyFTPAnon", state: "finished", status: "open",
		stack: ["Python"],
		shortDescription: {
			en: "A Python scanner that checks whether an FTP server allows anonymous, account-free logins.",
			fr: "Un scanner Python qui vérifie si un serveur FTP autorise les connexions anonymes sans compte.",
		},
		description: {
			en: "PyFTPAnon is a small Python tool that checks a file server for a common mistake: leaving the door open for anyone, without a password. It tries to log in anonymously and, if it works, lists which files a stranger could reach, which helps catch this kind of oversight quickly.",
			fr: "PyFTPAnon est un petit outil Python qui vérifie si un serveur de fichiers a une erreur courante : laisser la porte ouverte à n'importe qui, sans mot de passe. Il tente de s'y connecter sans identifiant et, si ça fonctionne, liste les fichiers qu'un inconnu pourrait atteindre, ce qui permet de repérer rapidement ce genre d'oubli.",
		},
		learned: {
			en: "This project introduced me to the fundamentals of the FTP protocol, including client-server file access. It was also my introduction to Python.",
			fr: "Ce projet m'a initié aux fondamentaux du protocole FTP, notamment l'accès aux fichiers entre client et serveur. Ce fut aussi mon introduction à Python.",
		},
		picture: "./assets/logos/pyftpanon.svg",
		href: "https://github.com/Gun8hoot/PyFTPAnon",
	},
	{
		label: "WWipp", state: "finished", status: "open",
		stack: ["C", "GNU Make"],
		shortDescription: {
			en: "A Linux wiper written in C that walks a filesystem and securely erases every file it finds (for educational purposes).",
			fr: "Un wiper Linux écrit en C qui parcourt un système de fichiers et efface chaque fichier de façon sécurisée (à des fins éducatives).",
		},
		description: {
			en: "WWipp is a tool for Linux, built purely to learn, that permanently destroys files instead of just deleting them. Normally, deleting a file only hides it; the data is often still recoverable. WWipp goes through every file in a folder and overwrites its content first, so there is nothing left to recover. I built it after the 42 piscine to get better at C and to understand what really makes a deleted file recoverable, or not.",
			fr: "WWipp est un outil pour Linux, réalisé uniquement pour apprendre, qui détruit définitivement des fichiers au lieu de simplement les supprimer. Normalement, supprimer un fichier ne fait que le cacher : les données restent souvent récupérables. WWipp parcourt tous les fichiers d'un dossier et écrase d'abord leur contenu, pour qu'il ne reste rien à récupérer. Je l'ai réalisé après la piscine de 42 pour progresser en C et comprendre ce qui rend un fichier supprimé récupérable, ou non.",
		},
		learned: {
			en: "This project gave me a clear understanding of how Linux manages files on disk, and why deletion alone does not erase file content. Writing it in C also helped me further develop my C skills.",
			fr: "Ce projet m'a donné une compréhension claire de la gestion des fichiers sur disque par Linux, et de pourquoi la suppression seule n'efface pas le contenu d'un fichier. L'écrire en C m'a aussi permis de continuer à développer mes compétences en C.",
		},
		picture: "./assets/logos/wwipp.svg",
		href: "https://github.com/Gun8hoot/WWipp",
	},
	{
		label: "ft_irc", state: "wip", status: "open",
		stack: ["C++", "GNU Make"],
		shortDescription: {
			en: "A group project building an IRC server in C++, handling channels, messaging and operators.",
			fr: "Un projet de groupe qui construit un serveur IRC en C++, gérant salons, messages et opérateurs.",
		},
		description: {
			en: "ft_irc is a group project from the 42 core curriculum: we built a server for IRC, one of the oldest group chat systems still in use, from scratch in C++. It lets several people connect at once, pick a nickname, join channels, send private or group messages, and gives channel operators controls like kicking someone out or changing the topic. My part covered reading and understanding incoming messages, logging clients in, keeping connections alive, and the invite and topic features.",
			fr: "ft_irc est un projet de groupe du tronc commun de 42 : nous avons construit de zéro, en C++, un serveur pour IRC, l'un des plus anciens systèmes de discussion de groupe encore utilisés. Il permet à plusieurs personnes de se connecter en même temps, de choisir un pseudonyme, de rejoindre des salons, d'envoyer des messages privés ou de groupe, et donne aux opérateurs de salon des pouvoirs comme exclure quelqu'un ou changer le sujet. Ma part couvrait la lecture et la compréhension des messages reçus, la connexion des clients, le maintien des connexions, ainsi que les fonctionnalités d'invitation et de sujet.",
		},
		learned: {
			en: "This project gave me a solid understanding of the IRC protocol, from client identification to channel and message handling. It also deepened my knowledge of Unix sockets, as the server manages multiple client connections simultaneously.",
			fr: "Ce projet m'a donné une solide compréhension du protocole IRC, de l'identification des clients à la gestion des salons et des messages. Il a aussi approfondi mes connaissances des sockets Unix, le serveur gérant plusieurs connexions clientes simultanément.",
		},
		picture: "./assets/logos/ft_irc.svg",
		href: "https://github.com/thlibers/irc",
	},
	{
		label: "Portfolio", state: "finished", status: "open",
		stack: ["TypeScript", "CSS", "HTML"],
		shortDescription: {
			en: "The terminal-themed website you are currently on, built with React and served with Bun.",
			fr: "Le site au thème terminal sur lequel vous êtes, construit avec React et servi avec Bun.",
		},
		description: {
			en: "This portfolio is the website you are currently browsing. I wanted it to look like a terminal and a written document at the same time, down to the fake boot-up sequence when the page loads. It is built with React and TypeScript, available in French and English, and explains technical words like this one through small tooltips, including the window you're reading right now.",
			fr: "Ce portfolio est le site que vous parcourez en ce moment. Je voulais qu'il ressemble à la fois à un terminal et à un document écrit, jusqu'à la fausse séquence de démarrage au chargement de la page. Il est construit avec React et TypeScript, disponible en français et en anglais, et explique les mots techniques comme celui-ci grâce à de petites info-bulles, y compris la fenêtre que vous êtes en train de lire.",
		},
		learned: {
			en: "This was my first experience managing and securing a production server, including a complete DNS setup with Cloudflare and a real-world NGINX configuration. The frontend was built with AI assistance, as web development is not my primary field.",
			fr: "Ce fut ma première expérience de gestion et de sécurisation d'un serveur en production, incluant une configuration DNS complète avec Cloudflare et une configuration NGINX en conditions réelles. Le frontend a été réalisé avec l'assistance de l'IA, le développement web n'étant pas mon domaine principal.",
		},
		picture: "./assets/logos/portfolio.svg",
		href: "https://github.com/Gun8hoot/portfolio",
	},
];

// An empty list hides the hackathons section.
const HACKATHONS: Hackathon[] = [
	{
		name: "42 x DINUM",
		status: "open",
		stack: ["Python", "TypeScript", "Docker", "GNU Make"],
		// TODO: put the PassOn screenshot under src/assets/images/preview/ and import it at the top
		// of this file like ctrl_tuiPreview. Until then the window shows the text only.
		picture: "./assets/images/preview/passon.png",
		organizer: { en: "42, DINUM", fr: "42, DINUM" },
		date: "2025-09-14",
		duration: { en: "5 days", fr: "5 jours" },
		location: { en: "Isle of Oléron, France", fr: "Île d'Oléron, France" },
		position: { en: "", fr: "" },
		link: "https://github.com/liliane0128/PassOn_Dinum",
		description: {
			en: "This project was part of a hackathon organized by 42 and DINUM, the French government's digital agency: our team built PassOn, an assistant that helps a civil servant leaving a job hand their work over properly. It reads through someone's documents and files and uses AI to turn them into a clear, structured handover sheet, which the employee can check and their manager can still correct, all inside the government's own office tools, so nothing leaves their existing account. I built the infrastructure and the backend.",
			fr: "Ce projet faisait partie d'un hackathon organisé par 42 et la DINUM, l'agence numérique de l'État : notre équipe y a construit PassOn, un assistant qui aide un agent qui quitte son poste à bien transmettre son travail. Il lit les documents et fichiers de la personne puis utilise l'IA pour les transformer en une fiche de passation claire et structurée, que l'agent peut vérifier et que son manager peut encore corriger, le tout dans les outils bureautiques de l'État, sans que rien ne sorte de son compte existant. J'ai réalisé l'infrastructure et le backend.",
		},
		learned: {
			en: "Building the backend for this project gave me practical experience with the Django framework, structuring routes, data and logic under the time constraints of a hackathon.",
			fr: "Construire le backend de ce projet m'a donné une expérience pratique du framework Django, en structurant les routes, les données et la logique sous les contraintes de temps d'un hackathon.",
		},
	},
];

// A hackathon opens in the same window as a project.
const hackathonWindow = (h: Hackathon): ProjectWindowData => ({
	label: h.name,
	state: "finished",
	status: h.status,
	stack: h.stack,
	description: h.description,
	learned: h.learned,
	picture: h.picture,
	href: h.link,
});

// "2025-03-14" -> "March 14, 2025" / "14 mars 2025"
const formatDate = (iso: string, lang: Lang) =>
	new Date(iso).toLocaleDateString(lang, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

// Group labels are kept short on purpose: they sit in a 12ch column.
const SKILLS: SkillGroup[] = [
	{ label: { en: "languages", fr: "langages" }, items: ["C", "C++", "JS", "TS", "Shell", "Python", "GNU Make", "ASM x86-x64"] },
	{ label: { en: "reversing", fr: "reverse" }, items: ["Ghidra", "Radare2", "JADX"] },
	{ label: { en: "systems", fr: "systèmes" }, items: ["Linux", "Docker", "Git", "AppArmor"] },
	{ label: { en: "services", fr: "services" }, items: ["NGINX"] },
	{ label: { en: "security", fr: "sécurité" }, items: ["Hashcat", "Burp Suite"] },
	{ label: { en: "network", fr: "réseaux"}, items: ["Wireshark", "nmap"]},
	{ label: { en: "protocols", fr: "protocoles" }, items: ["IP", "SSH", "DHCP", "HTTP", "DNS", "FTP"] },
];

// "https://www.github.com/Gun8hoot/" -> "github.com/Gun8hoot"
// "mailto:contact@nathan.clavel.sh"  -> "contact@nathan.clavel.sh"
const shortUrl = (href: string) =>
	href.replace(/^https?:\/\/(www\.)?/, "").replace(/^mailto:/, "").replace(/\/$/, "");

// The lines that fall in one after another when the page appears after the boot, in page order.
const FALL_LINES = [
	".name",
	".section_title",
	".description > p",
	".social > li",
	".skill_row",
	".project > li",
	".hackathons > li",
	".contact_form > .contact_field",
	".contact_form > .contact_note",
	".contact_form > .contact_submit",
].join(", ");

// animated: the intro animations are on (the name first, then every line falls in);
// off: the page just slides in from the right.
export function Portfolio({ lang, animated = false }: { lang: Lang; animated?: boolean })
{
	// Read once, when the page appears: switching the toggle later only counts for the next visit
	// (changing it now would replay the entrance).
	const [intro] = useState(animated);
	const mainRef = useRef<HTMLElement>(null);
	const t = UI[lang];
	const [openProject, setOpenProject] = useState<ProjectWindowData | null>(null);
	const [brokenPictures, setBrokenPictures] = useState<Set<string>>(new Set());
	const copyToast = useCopyToast();

	// Clicking the Email link copies the address instead of opening the visitor's mail client.
	const copyEmail = async (e: MouseEvent, href: string) => {
		e.preventDefault();
		const email = href.replace(/^mailto:/, "");
		try {
			await navigator.clipboard.writeText(email);
		} catch {
			// Clipboard API unavailable (older Safari, non-HTTPS, permission denied): fall back
			// to the old select-and-copy trick with a throwaway, invisible textarea.
			try {
				const area = document.createElement("textarea");
				area.value = email;
				area.style.position = "fixed";
				area.style.opacity = "0";
				document.body.appendChild(area);
				area.select();
				document.execCommand("copy");
				document.body.removeChild(area);
			} catch {
				return; // copying truly isn't possible here: don't claim it worked
			}
		}
		copyToast.show();
	};

	// The boothist screen leaves the page scrolled to the bottom: start at the top.
	useLayoutEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	// Intro: number the lines in page order (before the first paint) so each one falls in
	// a little after the previous one. The name comes first, alone.
	useLayoutEffect(() => {
		if (!intro || !mainRef.current) return;
		let n = 0;
		for (const el of mainRef.current.querySelectorAll<HTMLElement>(FALL_LINES)) {
			el.classList.add("fall");
			if (el.classList.contains("name")) {
				el.classList.add("fall--name");
			} else {
				el.style.setProperty("--fall", String(n++));
			}
		}
	}, [intro]);

	// Preload every project's picture as soon as the page loads, so by the time
	// someone actually opens a window we already know which pictures are broken
	// and ProjectWindow can pick the right layout on its first paint — rather
	// than starting with the picture column and only discovering it's missing
	// (via the <img>'s onError) after the window has already been shown.
	useEffect(() => {
		for (const { picture } of [...PROJECTS, ...HACKATHONS]) {
			const img = new Image();
			img.onerror = () => setBrokenPictures((prev) => new Set(prev).add(picture));
			img.src = picture;
		}
	}, []);

	return (
		<TermProvider lang={lang}>
			<main ref={mainRef} className={`portfolio ${intro ? "portfolio--fall" : "portfolio--slide"}`}>
				<h1 className="name">
					Nathan "Gun8hoot" Clavel<span className="cursor" aria-hidden="true">█</span>
				</h1>

				<h2 className="section_title">{t.titles.description}</h2>
				<div className="description">
					<p>{renderTerms(t.intro)}</p>
					{t.story.map((paragraph) => (
						<p key={paragraph}>{renderTerms(paragraph)}</p>
					))}
					<p>{renderTerms(t.searching)}</p>
					{/*<p>{renderTerms(t.ssh)}</p>*/}
				</div>

				<h2 className="section_title">{t.titles.links}</h2>
				<ul className="social">
					{PROFILES.map(({ label, href }) =>
						label === "Email" ? (
							<li key={label}>
								{/* copies the address instead of opening a mail client; href kept so middle-click
								   / "open in new tab" / screen readers still get a real mailto: link */}
								<a className="link" href={href} onClick={(e) => copyEmail(e, href)}>
									<span className="link_name">{label}</span>
									<span className="link_url">{shortUrl(href)}</span>
								</a>
							</li>
						) : (
							<li key={label}>
								<a className="link" href={href} target="_blank" rel="noopener noreferrer">
									<span className="link_name">{label}</span>
									<span className="link_url">{shortUrl(href)}</span>
								</a>
							</li>
						),
					)}
				</ul>

				<h2 className="section_title">{t.titles.skills}</h2>
				<ul className="skills">
					{SKILLS.map(({ label, items }) => (
						<li className="skill_row" key={label.en}>
							<span className="skill_group">{label[lang]}</span>
							<ul className="skill_items">
								{items.map((item) => (
									<li key={item}><Term name={item}>{item}</Term></li>
								))}
							</ul>
						</li>
					))}
				</ul>

				<h2 className="section_title">{t.titles.projects}</h2>
				<ul className="project">
					{PROJECTS.map((project) => {
						const { label, state, status, stack, shortDescription } = project;
						return (
							<li key={label}>
								{/* clicking a project opens the ProjectWindow instead of navigating away */}
								<button type="button" className="link" onClick={() => setOpenProject(project)}>
									<span className="link_name">{label}</span>
									<span className={`project_state ${state === "finished" ? "project_state--done" : "project_state--wip"}`}>{t.states[state]}</span>
									<span className="link_url">{t.statuses[status]}</span>
								</button>
								<p className="project_stack">{stack.join(", ")}</p>
								{shortDescription[lang] && <p className="project_desc">{renderTerms(shortDescription[lang])}</p>}
							</li>
						);
					})}
				</ul>

				{openProject && (
					<ProjectWindow
						key={openProject.label}
						project={openProject}
						lang={lang}
						pictureBroken={brokenPictures.has(openProject.picture)}
						ui={{
							description: t.project.description,
							learned: t.project.learned,
							viewRepo: t.project.viewRepo,
							close: t.project.close,
							enlarge: t.project.enlarge,
							states: t.states,
							statuses: t.statuses,
						}}
						onClose={() => setOpenProject(null)}
					/>
				)}

				{HACKATHONS.length > 0 && (
					<>
						<h2 className="section_title">{t.titles.hackathons}</h2>
						<ul className="hackathons">
							{HACKATHONS.map((hackathon) => {
								const { name, status, organizer, date, duration, location, position } = hackathon;
								return (
								<li key={`${name}-${date}`}>
									{/* like a project: opens the ProjectWindow instead of navigating away */}
									<button type="button" className="link" onClick={() => setOpenProject(hackathonWindow(hackathon))}>
										<span className="link_name">{name}</span>
										<span className="hack_position">{position[lang]}</span>
										<span className="link_url">{t.statuses[status]}</span>
									</button>
									<dl className="hack_meta">
										<div><dt>{t.hackathon.organizer}</dt><dd>{organizer[lang]}</dd></div>
										<div><dt>{t.hackathon.date}</dt><dd>{formatDate(date, lang)}</dd></div>
										<div><dt>{t.hackathon.duration}</dt><dd>{duration[lang]}</dd></div>
										<div><dt>{t.hackathon.location}</dt><dd>{renderTerms(location[lang])}</dd></div>
									</dl>
								</li>
								);
							})}
						</ul>
					</>
				)}

				<h2 className="section_title">{t.titles.contact}</h2>
				<ContactForm ui={t.contact} lang={lang} />
			</main>

			{copyToast.toast !== null && (
				<CopyToast lang={lang} toastKey={copyToast.toast} onClose={copyToast.hide} />
			)}
		</TermProvider>
	);
}
