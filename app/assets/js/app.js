(function() {
  var socket = io();
  var connected = false;
  var program = {};
  var vm;

  socket.on('problem', function(data) {
    console.log(data);
    if(!data) {
      document.body.classList.add("no-question");
      return;
    }
    if(!connected) {
      vm = new Vue({
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
        value: "def " + data.functionName + "(" + data.callSignature +"):",
        mode:  "python",
        lineNumbers: true
      });
    }
  });
  socket.on('results', function(data, time) {
    console.log(data, time);
  });

  function showScoreboard() {
    console.log("getting scoreboard");
    $.ajax('/api/scoreboard/recent')
    .then(function(data){
      console.log(data);
    });
  }
  $('.showScore').on('click', showScoreboard);
})();
