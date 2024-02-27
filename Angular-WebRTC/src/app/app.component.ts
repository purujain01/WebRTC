import { Component,ElementRef,Inject,ViewChild } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent{
  title = 'Angular-WebRTC';
  connection!:string
  p1InBoundStream!:any
  p2InBoundStream!:any
  mutedValue:boolean = false
  audioTrack!:any
  videoTrack!:any
  connectionOpen:boolean = false
  mediaStreamConstraints:any = {
    audio: true,
    video: true
  }

  @ViewChild("p1") p1Element!: ElementRef;
  @ViewChild("p2") p2Element!: ElementRef;

  constructor() {}

  ngOnInit(){
    navigator.mediaDevices.getUserMedia(this.mediaStreamConstraints).then((stream) => {
      this.audioTrack = stream.getAudioTracks()[0]
      this.videoTrack = stream.getVideoTracks()[0]
      this.p1InBoundStream = new MediaStream()
      this.p1InBoundStream.addTrack(this.audioTrack)
      this.p1InBoundStream.addTrack(this.videoTrack)
      this.p1Element.nativeElement.srcObject = this.p1InBoundStream
    }).catch((err) => {
      console.log(err)
    }) 
  }

  muted(){
    this.mutedValue = !this.mutedValue
    console.log(this.mutedValue)
    if(this.mutedValue)
     this.p1InBoundStream.removeTrack(this.p1InBoundStream.getAudioTracks()[0])
    else 
      this.p1InBoundStream.addTrack(this.audioTrack)

    this.p1Element.nativeElement.srcObject = this.p1InBoundStream
  }
  startConnection  = async() => {

    this.connection = "started"
    this.connectionOpen = true
    this.p2InBoundStream = new MediaStream()
    const p1 = new RTCPeerConnection()
    const p2 = new RTCPeerConnection()
    var p2Stream = new MediaStream() 

    console.log(this.audioTrack)
    console.log(this.videoTrack)
    p1.addTrack(this.audioTrack, this.p1InBoundStream)
    p1.addTrack(this.videoTrack, this.p1InBoundStream)

    p2.addTrack(this.audioTrack, p2Stream)
    p2.addTrack(this.videoTrack, p2Stream)
    
    p1.onicecandidate = (e) => {
        console.log("P1 Ice Candidate")
        console.log(e)
        if(e.candidate){
            p2.addIceCandidate(e.candidate)
        }
    }
    p2.onicecandidate = (e) => {
        console.log("P2 Ice Candidate")
        console.log(e)
        if(e.candidate){
            p1.addIceCandidate(e.candidate)
        }
    }

    p1.oniceconnectionstatechange = (e) => {
        console.log("Change connection State P1")
        console.log(p1.iceConnectionState)
        console.log("p1 end",p1)
        console.log("p2 end",p2)
    }
    p2.oniceconnectionstatechange = (e) => {
        console.log("Change connection State P2")
        console.log(p2.iceConnectionState)
        console.log("p1 end",p1)
        console.log("p2 end",p2)
    }
  
    p1.onnegotiationneeded = async() => {
        console.log("onnegotiation called")
        const p1Offer = await p1.createOffer()
        console.log("Offer", p1Offer)
        await p1.setLocalDescription(p1Offer)
        if(p1.localDescription)
          await p2.setRemoteDescription(p1.localDescription)
        console.log("-----------------------------------")
        const p2LocalDescription = await p2.createAnswer()
        console.log("Answer", p2LocalDescription)
        await p2.setLocalDescription(p2LocalDescription)
        if(p2.localDescription)
          await p1.setRemoteDescription(p2.localDescription)
        console.log("p1",p1)
        console.log("p2",p2)
    }

  p1.ontrack = (event) => {
      console.log("P1 On track called")
      console.log(event)
      this.p2InBoundStream.addTrack(event.track)
      this.p2Element.nativeElement.srcObject = this.p2InBoundStream
  }
    
  }
}
