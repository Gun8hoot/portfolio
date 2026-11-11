<div align="center">
	<h1>Portfolio of Nathan "Gun8hoot" CLAVEL</h1>
</div>
<br>
	
![preview](./.images/preview.png)

<br>
<div align="center">
	<h1>Deploy</h1>
</div>

1. Make sure that bun is installed on your system
```sh
if [ "$(which bun)" == "" ]; then echo "bun is not installed, go on https://bun.com/get to install it"; xdg-open "https://bun.com/get"; else echo "bun is installed"; fi;
```
2. Clone the repository and go on the project folder
```sh
git clone https://github.com/gun8hoot/portfolio.git && cd portfolio
```
3. Install every dependency
```sh
bun i
```
4. Launch the web server in production mode
```sh
bun run start
```
- To launch the web server in developement mode
```sh
bun run dev
```
