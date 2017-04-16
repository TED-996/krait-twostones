SERVER:

* se citesc `.config/routes.xml`
* se adauga la locatii de import din python: `.config`, `.py`, `.ctrl` => daca dati import ceva, se verifica si directoarele astea pentru fisiere .py
* se seteaza niste variabile Python:
	* `project_dir`: site-root
	* `response`: None
	* `content-type`: None
* se executa `.config/init.py` -- aici o sa aveti cod python care dureaza

CLIENT: 

* send (tot)

SERVER:

* **fork** (servire client) - tot ce e sub nu se salveaza
* receive (tot)
* **fork** (servire request) - tot ce e sub nu se salveaza
* cauta o ruta (dupa protocol + url) 
* verifica filename (din ruta) cu '.' la inceput - orice director/file din path
	* daca da, 404
* daca filename-ul este director se alege `director/index`
* daca filename-ul nu exista si:
	* exista `filename.py/.html/.htm/.pyml`: se alege `filename.py/.html/.htm/.pyml`
	* filename-ul este `filename.html` si exista `filename.htm`, alegem `filename.htm` sau invers
* se verifica filename-ul in cache; daca nu exista / este modificat:
	* citire sursa => file parsed
		* daca este `.py`: se salveaza ca cod de executat
		* daca `.html`, `.htm`, `.pyml`: se parseaza dupa sintaxa (@...@) + etc. (vezi krait syntax pe wiki) 
		* altfel, se salveaza ca plaintext
	* se adauga la cache obiectul aflat mai sus
	* !! se verifica sintaxa pyml, dar nu python (python abia cand se executa codul - this may change in the future)
	* in ciuda fork-ului, asta se salveaza si in procesul principal (root server), dar nu si in "servire client": primul client nu beneficiaza deloc de cache, chiar dupa ce se repeta request-uri. C'est la vie.
* se executa fisierul scos din cache
	* se seteaza variabila `request` cu un obiect de tip `krait.Request` pentru a-l putea accesa din python
	* se executa python-ul
	* se salveaza stringurile rezultate
	* se verifica raspuns schimbat din python:
		1. daca este setata varabila response (in python: `response = krait.Response(....)`, !! din pagina rutabila), se inlocuieste total raspunsul de mai sus cu ce s-a setat in python
		2. daca s-a apelat din python `mvc.set_init_ctrl(ctrl_obj)`: !!initializarea ctrl_obj s-a facut deja - cel mai probabil in `CtrlClass.__init__()`!
			* `view = ctrl_obj.get_view()` - !!obligatoriu trebuie sa existe
			* `ctrl = ctrl_obj` - pentru a fi accesibil din view
			* se aduce in cache `view` si se executa (dupa regulile de mai sus); view-ul foloseste variabila `ctrl` pentru a accesa controller-ul
		3. daca s-a apelat din python `set_content_type(ceva)` se foloseste content-type-ul ales -- !!important pentru view-uri, altfel nu se cunoaste content-type-ul **view-ului** (html/json/etc)
	* daca nu este setat deja, se deduce content-type-ul:
		* dupa extensia fisierului fizic (rutabil - nu din url, de pe disc)
		* daca filename-ul este `filename.ext.pyml`, se verfifica in schimb `filename.ext` (pentru chestii gen `.js`, `.css`, se poate include asa python - salvati ca `whatever.js.pyml`)
	* se alege stocarea in cache-ul clientului
		* dupa fisiere cu regex `.config/` {`cache-private.cfg`, `cache-public.cfg`, `cache-nostore.cfg`, `cache-longterm.cfg`}, un regex / linie
			* public: fisiere sunt independente de user, pot fi cache-uite inclusiv de cache-uri shared
			* private: fisiere dependente de user, pot fi cache-uite in cache-ul browserului, dar nu in cache-uri shared
			* nostore: fisiere care nu trebuie cache-uite. In general, pagini dinamice (ca sa vada update-uri) sau scripturi (ca sa se execute de fiecare data)
			* longterm: in combinatie cu public/private, sa fie tinute in cache mai mult timp: deocamdata, 10 zile vs 5 minute 
		* altfel, dupa daca pagina contine python
	* se calculeaza dimensiunea raspunsului
	* se trimit headere
	* se trimit bucati de raspuns una cate una (optimizare, not really relevant)

CLIENT

* se primeste raspunsul
* +- se salveaza in cache client
* eventual se trimite alt request

SERVER

* end fork (servire request)
* (in fork servire client)
* se verifica daca conexiunea ramane deschisa (eventual alt request)
	* daca da, repeat \^\^\^
	* altfel, exit fork (servire client) 

Termeni:

pyml: sintaxa descrisa pe wiki, folosita in pagini rutabile / view-uri (@...., @for...:, etc)
pagina rutabila: pagina la care ajunge ruta (din site-root)