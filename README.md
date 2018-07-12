# hydron

## Install in OS X

```
export LC_ALL=en_US.UTF-8 && export LANG=en_US.UTF-8
git clone https://github.com/nucypher/pyUmbral.git && cd pyUmbral && git checkout 23bc511f4633698652d490b17997d59529352bb5
git clone https://github.com/nucypher/bytestringSplitter.git && cd bytestringSplitter && git checkout 0ba370f1223188a9464257c30205cd76200b6d09
cd bytestringSplitter && pip3.6 install . && python3.6 setup.py install
cd pyUmbral && pipenv --python 3.6 install ./wheelhouse/cryptography-2.3.dev1-cp36-cp36m-macosx_10_13_x86_64.whl --skip-lock pynacl && pipenv shell
pip3.6 install pytest && python3.6 -m pytest ./tests
```
