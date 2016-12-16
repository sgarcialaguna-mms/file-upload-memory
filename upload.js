var receiverAddress = '127.0.0.1'
var receiverPort = '8000'
var receiverUrl = 'http://' + receiverAddress + ':' + receiverPort + '/upload/'

var queuedFiles = []

var uploader = new qq.FineUploaderBasic({
    debug: true,
    request: {
        endpoint: receiverUrl
    },
    callbacks: {
        onComplete: function(id, name)
        {
            document.getElementById('messages').innerHTML = 'Received ' + name + '<br>' + queuedFiles.length + ' files to go.'
            processNextFile()
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
    processNextFile()
})

function processNextFile()
{
    var nextFile = queuedFiles.shift()
    if (nextFile)
    {
        processFile(nextFile)
    }
}

function processFile(file)
{
    var reader = new FileReader()
    reader.onload = function ()
    {
        console.log('Processing file ' + file.name)
        var arrayBuffer = this.result
        var byteArray = new Uint8Array(arrayBuffer)
        // Manipulate the byteArray in some way...
        var blob = new window.Blob([byteArray])
        uploader.addFiles({blob: blob, name: file.name})
    }
    reader.readAsArrayBuffer(file)
}
