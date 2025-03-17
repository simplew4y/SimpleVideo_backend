import http.client
import mimetypes
from codecs import encode

conn = http.client.HTTPSConnection("api.302ai.cn")
dataList = []
boundary = 'wL36Yn8afVp8Ag7AmP8qZ0SA4n1v9T'
dataList.append(encode('--' + boundary))
dataList.append(encode('Content-Disposition: form-data; name=init_image; filename={0}'.format('/Users/apple/Downloads/pupu.png')))

fileType = mimetypes.guess_type('/Users/apple/Downloads/pupu.png')[0] or 'application/octet-stream'
dataList.append(encode('Content-Type: {}'.format(fileType)))
dataList.append(encode(''))

with open('/Users/apple/Downloads/pupu.png', 'rb') as f:
   dataList.append(f.read())
dataList.append(encode('--' + boundary))
dataList.append(encode('Content-Disposition: form-data; name=text_prompt;'))

dataList.append(encode('Content-Type: {}'.format('text/plain')))
dataList.append(encode(''))

dataList.append(encode(""))
dataList.append(encode('--' + boundary))
dataList.append(encode('Content-Disposition: form-data; name=seconds;'))

dataList.append(encode('Content-Type: {}'.format('text/plain')))
dataList.append(encode(''))

dataList.append(encode("10"))
dataList.append(encode('--' + boundary))
dataList.append(encode('Content-Disposition: form-data; name=seed;'))

dataList.append(encode('Content-Type: {}'.format('text/plain')))
dataList.append(encode(''))

dataList.append(encode(""))
dataList.append(encode('--' + boundary))
dataList.append(encode('Content-Disposition: form-data; name=image_as_end_frame;'))

dataList.append(encode('Content-Type: {}'.format('text/plain')))
dataList.append(encode(''))

dataList.append(encode("false"))
dataList.append(encode('--'+boundary+'--'))
dataList.append(encode(''))
body = b'\r\n'.join(dataList)
payload = body
headers = {
   'Authorization': 'Bearer sk-PjN1GKx3Wdgp1OWOFI9dDIRPgl3BLSl5RgVSQEyReHQHecYa',
   'Content-Type': 'multipart/form-data',
   'Content-type': 'multipart/form-data; boundary={}'.format(boundary)
}
conn.request("POST", "/runway/submit", payload, headers)
res = conn.getresponse()
data = res.read()
print(data.decode("utf-8"))