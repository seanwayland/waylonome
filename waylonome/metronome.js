class Metronome
{
    constructor(tempo = 120)
    {
        this.audioContext = null;
        this.notesInQueue = [];         // notes that have been put into the web audio and may or may not have been played yet {note, time}
        this.currentQuarterNote = 0;
        this.tempo = tempo;
        this.lookahead = 25;          // How frequently to call scheduling function (in milliseconds)
        this.scheduleAheadTime = 0.1;   // How far ahead to schedule audio (sec)
        this.nextNoteTime = 0.0;     // when the next note is due
        this.isRunning = false;
        this.intervalID = null;
        // a value for "swing" between zero and one hundred
        this.swing = 20;
        this.barEightNotes = 6
        // a boolean that determines if the next note is an "and" or not ie on the beat or off the beat 
        // on the beat is "zero" and then the next note is the swing value applied to the tempo 
        // if it is "one the beat" then schedule the next note exactly the swing amount in the future 
        // if its "off the beat" then shedule the next beat 100 minus the swing amount
        
    }

    nextNote()
    {
        // Advance current note and time by a quarter note (crotchet if you're posh)

        if (this.currentQuarterNote % 2 == 0){

           // var secondsPerBeat = (60.0 / this.tempo)*(this.swing/100);
            // Notice this picks up the CURRENT tempo value to calculate beat length.
            var secondsPerBeat = 0.3
            this.nextNoteTime += secondsPerBeat; // Add beat length to last beat time
            console.log(this.nextNoteTime)
        
            this.currentQuarterNote++;    // Advance the beat number, wrap to zero
            if (this.currentQuarterNote == barEightNotes) {
                this.currentQuarterNote = 0;
            }

            this.onBeat == false;
            //console.log(this.onBeat)
           // console.log(secondsPerBeat)

        }

        else {

            {
             //   var secondsPerBeat = (60.0 / this.tempo)*((100 - this.swing)/100);
                 var secondsPerBeat = 0.1
                //var secondsPerBeat = 60.0 / this.tempo; // Notice this picks up the CURRENT tempo value to calculate beat length.
                this.nextNoteTime += secondsPerBeat; // Add beat length to last beat time
                console.log(this.nextNoteTime)
            
                this.currentQuarterNote++;    // Advance the beat number, wrap to zero
                if (this.currentQuarterNote == barEightNotes) {
                    this.currentQuarterNote = 0;
                }
    
                //this.onBeat == true;
                //console.log(this.onBeat)
                //console.log(secondsPerBeat)
    
            }


        }



    }

    scheduleNote(beatNumber, time)
    {
        // push the note on the queue, even if we're not playing.
        this.notesInQueue.push({ note: beatNumber, time: time });
    
        // create an oscillator
        const osc = this.audioContext.createOscillator();
        const envelope = this.audioContext.createGain();
        
        osc.frequency.value = (beatNumber % 6 == 0) ? 1000 : 800;
        envelope.gain.value = 1;
        envelope.gain.exponentialRampToValueAtTime(1, time + 0.001);
        envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.02);

        osc.connect(envelope);
        envelope.connect(this.audioContext.destination);
    
        osc.start(time);
        osc.stop(time + 0.03);
    }

    scheduler()
    {
        // while there are notes that will need to play before the next interval, schedule them and advance the pointer.
        while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime ) {
            this.scheduleNote(this.currentQuarterNote, this.nextNoteTime);
            this.nextNote();
            this.onBeat = !this.onBeat
        }
    }

    start()
    {
        if (this.isRunning) return;

        if (this.audioContext == null)
        {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        this.isRunning = true;

        this.currentQuarterNote = 0;
        this.nextNoteTime = this.audioContext.currentTime + 0.05;

        this.intervalID = setInterval(() => this.scheduler(), this.lookahead);
    }

    stop()
    {
        this.isRunning = false;

        clearInterval(this.intervalID);
    }

    startStop()
    {
        if (this.isRunning) {
            // when it starts we are "one the beat"
            this.onBeat = 1;
            this.stop();
        }
        else {
            this.start();
        }
    }
}