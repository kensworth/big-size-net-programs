(function() {
  var socket = io();
  var connected = false;
  var program = {};
  var cm;
  var vm = new Vue({
    el:"#view",
    data: {
      ready: false,
      program: {},
      scoreboard: [],
      scoreboardOpen: false,
      currentPage: 0,
      username: "",
    },
    methods: {
      submitCode: function() {
        socket.emit("submission", {
          code: cm.doc.getValue(),
          programId: this.program._id,
          username: this.username,
        });
      },
      closeScoreboard: function() {
        this.scoreboardOpen = false;
      },
    },
    mounted: function() {
      this.ready = true;
    }
  });

  function initWithProgram(data) {
    vm.$set(vm, 'program', data);
    cm = CodeMirror(document.getElementById("code"), {
      value: "def " + data.functionName + "(" + data.callSignature +"):",
      mode:  "python",
      lineNumbers: true
    });
  }

  socket.on('problem', function(data) {
    console.log(data);
    if(!data) {
      document.body.classList.add("no-question");
      return;
    }
    if(!connected) {
      initWithProgram(data);
      connected = true;
    }
  });

  socket.on('results', function(data, time) {
    console.log(data, time);
    if(data) {
      console.log("congrats");
    }
  });

  function showScoreboard() {
    vm.scoreboardOpen = true;
    console.log("getting scoreboard");
    $.ajax('/api/scoreboard/recent')
    .then(function(data){
      vm.$set(vm, 'scoreboard', data);
    });
  }
  $('.showScore').on('click', showScoreboard);

  var modal = document.getElementById('modal');
  var submitName = document.getElementById('submit-name');
  var nameInput = document.getElementById('name-input');
  nameInput.focus();
  submitName.onclick = (e) => {
    e.preventDefault();
    modal.style.display = "none";
    vm.username = nameInput.value;
  };
})();
