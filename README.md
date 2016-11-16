# https-mixed-content-check
for check mixed content in website, alpha version 

## Getting Started
this is tools for check HTTP/HTTPS mixed content in whole of your website. 
fork from https://github.com/franciskim/check-mixed-content

## installing
```
npm install https-mixed-content-check -g
```

## usage
```
check --url https://www.example.com
```

## option
```
--domain example.com 
```
focus domain if don't add this option https-mixed-content-check will search all link that present in your website

```
--delay 5
```
delay time between each request, 0 by default 

```
--allowDuplicates 
```
re visit visited URLs, false by default

```
--userAgent 'https-mixed-content-check'
```
user agent that use for visit page,'https-mixed-content-check' by default 

```
--encode 'utf8'
```
encode that used, utf8 by defaul

## Authors
freeweed 

## License
This project is licensed under the WTFPL License - see the [LICENSE.md](LICENSE.md) file for details


