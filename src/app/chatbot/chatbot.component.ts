import { Component, OnInit } from '@angular/core';
import { InfermedicaService } from '../services/infermedica.service';
import { TouchSequence } from 'selenium-webdriver';
import { UsersService } from '../services/users.service';
import * as jspdf from 'jspdf'; 
import html2canvas from 'html2canvas';  

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit {

  msg: string = "Hello, Welcome to DoctorBot!!. How do you feel"
  crr: string = undefined;
  sex: string = '';
  age: number;
  extras: any;
  evidence: any = [];
  evidences: any = [];
  msgs: string[] = [];
  bod:any;
  q: any;
  b: any;
  items: any = [];
  id: string;
  ids: string[] = [];
  input: boolean = true;
  choice: string = 'present';
  stop: boolean = false;
  condition: any = [];
  userid: string;
  constructor(private infermedica: InfermedicaService,
    private usersservice: UsersService) { }

  ngOnInit() {
    this.msgs.push(this.msg);
    console.log(this.msgs)
    this.usersservice.getUser()
    .subscribe(user => {
      this.userid = user._id;
      this.sex = user.sex;
      this.age = user.age
    });
  }
  submit()
  {
    this.infermedica.nlp(this.crr)
    .subscribe(out => {
      out = out.json();
      this.bod = out;
      console.log(out)
      console.log(this.bod);
      console.log(this.bod.mentions);
      this.bod.mentions.forEach(element => {
        this.evidence.push({
          'id': element.id,'choice_id': element.choice_id,'initial': true
        }) 
        this.evidences.push({
          'id': element.id,'choice_id': element.choice_id,'initial': true,'common_name': element.common_name
        })       
      });
      console.log(this.evidence);
      // this.evidence = JSON.stringify(this.evidence);
      this.infermedica.diagnosis(this.evidence,"female",20)
      .subscribe(op => {
        op = op.json();
        this.q = op;
        this.condition = this.q.conditions;
        this.stop = this.q.should_stop;
        console.log(this.condition)
        this.b = this.q.question;
        this.items = this.b.items;
        this.msgs.push(this.b.text);
        console.log(this.items);
      })
    })
    this.crr = '';
    this.input = false;
  }
  submit1()
  {
    if(this.choice == "Yes")
    {
      this.choice = "present"
    }
    else if(this.choice == "No")
    {
      this.choice = "absent"
    }
    else if(this.choice == "Don't know")
    {
      this.choice = "unknown"
    }
    else
    {
      this.choice = "present"
    }
    this.evidence.push({
      'id': this.id,'choice_id': this.choice
    })
    this.infermedica.getsymptom(this.id)
    .subscribe(symptom => {
      console.log(symptom)
      symptom = symptom.json();
      this.evidences.push({
        'id': this.id,'choice_id': this.choice,'common_name': symptom.common_name
      })    
    })
    console.log(this.evidence);
    this.infermedica.diagnosis(this.evidence,"female",20)
      .subscribe(op => {
        op = op.json();
        this.q = op;
        this.condition = this.q.conditions;
        this.stop = this.q.should_stop;
        console.log(this.stop)
        this.b = this.q.question;
        this.items = this.b.items;
        this.msgs.push(this.b.text);
        console.log(this.items);
    })
    this.crr = '';
  }
  submit2(id: string,label: string)
  {
    console.log(id,label);
    this.choice = label;
    this.id = id;
  }
  submit3(id: string)
  {
    this.ids.push(id);
    console.log(this.ids);
  }
  submit4()
  {
    this.ids.forEach(element => {
      this.evidence.push({
        'id': element,'choice_id': "present"
      })
      this.infermedica.getsymptom(element)
      .subscribe(symptom => {
        console.log(symptom)
        symptom = symptom.json();
        this.evidences.push({
          'id': element,'choice_id': "present",'common_name': symptom.common_name
        })    
      })     
    });
    this.infermedica.diagnosis(this.evidence,"female",20)
      .subscribe(op => {
        op = op.json();
        this.q = op;
        this.condition = this.q.conditions;
        this.stop = this.q.should_stop;
        console.log(this.stop)
        this.b = this.q.question;
        this.items = this.b.items;
        this.msgs.push(this.b.text);
        console.log(this.items);
      })
      this.ids = [];
  }
  done()
  {
    this.infermedica.postResults(this.condition,this.evidences)    
  }
  public captureScreen()  
  {  
    var data = document.getElementById('contentToConvert');  
    html2canvas(data).then(canvas => {  
      // Few necessary setting options  
      var imgWidth = 208;   
      var pageHeight = 295;    
      var imgHeight = canvas.height * imgWidth / canvas.width;  
      var heightLeft = imgHeight;  
  
      const contentDataURL = canvas.toDataURL('image/png')  
      let pdf = new jspdf('p', 'mm', 'a4'); // A4 size page of PDF  
      var position = 0;  
      pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight)  
      pdf.save('result.pdf'); // Generated PDF   
    });  
  }
}