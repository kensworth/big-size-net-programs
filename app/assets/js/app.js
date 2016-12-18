(function() {
  var socket = io();
  var connected = false;
  var program = {};

  socket.on('problem', function(data) {
    console.log(data);
    if(!data) {
      document.body.classList.add("no-question");
      return;
    }
    if(!connected) {
      var vm = new Vue({
        el:"#view",
        data: {
          ready: false,
          program: data
        },
        methods: {
          submitCode: function() {
            console.log(myCodeMirror.doc.getValue());
            socket.emit("submission", {
              code: myCodeMirror.doc.getValue(),
              programId: this.program._id,
            });
          }
        },
        mounted: function() {
          this.ready = true;
          connected = true;
        }
      });

      var myCodeMirror = CodeMirror(document.getElementById("code"), {
        value: data.defaultCode,
        mode:  "python",
        lineNumbers: true
      });
    }
  });
})();
