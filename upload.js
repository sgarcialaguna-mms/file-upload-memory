var receiverAddress = 'receiver.example.com'
var receiverPort = '1234'
var receiverUrl = 'http://' + receiverAddress + ':' + receiverPort + '/upload_files/'
var fakeServer = window.sinon.fakeServer.create()

var queuedFiles = []

fakeServer.respondWith(receiverUrl,
    JSON.stringify({'success': 'true'}))
fakeServer.autoRespond = true

var uploader = new qq.FineUploaderBasic({
    debug: true,
    request: {
        endpoint: receiverUrl
    },
    callbacks: {
        onSubmit: function (id, name)
        {
            var file = this.getFile(id)
            if (file.isAnonymized)
            {
                return;
            }
            var reader = new FileReader()
            reader.onload = function()
            {
                var arrayBuffer = this.result
                var byteArray = new Uint8Array(arrayBuffer)
                // Manipulate the byteArray in some way...
                var blob = new window.Blob([byteArray])
                blob.isAnonymized = true
                // add the anonymized file instead
                uploader.addFiles({blob: blob, name: name})
            }
            reader.readAsArrayBuffer(file)
            // cancel the original file
            return false
        },
        onComplete: function(id, name)
        {
            $('#messages').html('Received ' + name + '<br>')
        }
    }
})

var dropzone = document.getElementById('dropzone')
dropzone.addEventListener('dragover', function (event)
{
    event.stopPropagation()
    event.preventDefault()

    event.dataTransfer.dropEffect = 'move'
})

dropzone.addEventListener('drop', function (event)
{
    event.stopPropagation()
    event.preventDefault()

    queuedFiles = queuedFiles.concat(Array.prototype.slice.call(event.dataTransfer.files))
})

window.setInterval(function(){
    var next10Files = queuedFiles.slice(0, 10)
    queuedFiles = queuedFiles.slice(10)
    if (next10Files.length > 0)
    {
        uploader.addFiles(next10Files)
    }
}, 1000)
