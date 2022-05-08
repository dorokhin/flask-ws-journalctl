# flask-ws-journalctl


Simple Flask WebSocket application which sends `journalctl -u unit.name -f` data to browser in realtime.

### Run:


to run only on localhost:
```console
~$ pip install -r requirements.txt
~$ gunicorn --bind 127.0.0.1:5000 --workers 3 app:app # 
```
Or run on external ip

Edit `'ws_url': 'ws://127.0.0.1:5000/log'` line in `app.py`, set your ip address.
```console
~$ gunicorn --bind 0.0.0.0:5000 --workers 3 app:app
```



![image](https://user-images.githubusercontent.com/10822884/167296254-06e2f71e-aaff-407a-98bb-d6da4eb8f020.png)
