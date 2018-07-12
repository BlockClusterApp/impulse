# hydron

##Install in OS X

```
git clone https://github.com/nucypher/pyUmbral.git && cd pyUmbral-master && git checkout 23bc511f4633698652d490b17997d59529352bb5
git clone https://github.com/nucypher/bytestringSplitter.git && cd bytestringSplitter-master && git checkout 0ba370f1223188a9464257c30205cd76200b6d09
cd pyUmbral-master && pipenv --python 3.6 install ./wheelhouse/cryptography-2.3.dev1-cp36-cp36m-macosx_10_13_x86_64.whl --skip-lock pynacl && pipenv shell
cd bytestringSplitter-master && pip3.6 install . && python3.6 setup.py install
```
