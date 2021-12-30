!(function(globalThis){
  const dayMap = [
    "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"
  ];
  globalThis.Calendar = class {
    constructor({
      el, // 绑定的元素
      start, // 开始时间
      days, // 持续天数
      timeHeight, // 单元格高度
      tasks, // 任务列表
    }){
      this.id = "" + Date.now() + Math.random();
      this.el = el;
      this.start = start || new Date();
      this.days = days || 7;
      // this.dayWidth = dayWidth || "200px";
      this.timeHeight = timeHeight || 60;
      this.tasks = tasks || [];

      this.renderStructure();
    }

    _createElement(tagName, attrs, innerText){ 
      const ele = document.createElement(tagName);

      ele.innerText = innerText;
      Object.entries(attrs).map(([key,value])=>{
        ele[key] = value
      })
      return ele
    }
    _getDateKey(Date){ 
      return `${Date.getFullYear()} - ${Date.getMonth()+1} - ${Date.getDate()}`

    }
    _getDays(){
      return [...new Array(this.days)].map((v,i)=>i).map((index)=>{
        const curDate = new Date((this.start.valueOf()) + index * 24 * 60 * 60 * 1000);
        return {
          key: this._getDateKey(curDate),
          text: `${curDate.getMonth()+1} - ${curDate.getDate()}`,
          day: `${dayMap[curDate.getDay()]}`
        }
      })
    }

    _getHours(){
      return [...new Array(24)].map((v,i)=>i).map((index)=>{
        return `${(index+"").padStart(2,0)} : 00`
      })
    }

    _getDayColumnWidth(){
      console.log( (this.el.clientWidth - 120) / this.days)
      return (this.el.clientWidth - 120) / this.days;
      // return document.querySelector(`.Calendar-header-date[data-id='${this.id}']`).clientWidth
    }


    /**
     * 渲染结构
     */
    renderStructure(){
      this.el.innerHTML = `
      <div class="Calendar-container" data-id=${this.id}>
        <div class="Calendar-header">
          <div class="Calendar-header-padleft"></div>
          ${
            this._getDays().map(dayItem=>{
              return `<div class="Calendar-header-date" data-id=${this.id}>
                <p>${dayItem.day}</p>
                <p>${dayItem.text}</p>
              </div>`
            }).join("")
          }
        </div>
        <div class="Calendar-scroll-content">
          <!-- 表格区域 -->
          <table width="100%" cellspacing="0" border="1" class="Calendar-table">
            <tbody>
              ${
                this._getHours().map((hourText)=>{
                  const hourTd = `<td class="Calendar-hour">${hourText}</td>`
                  const daysTd = this._getDays().map((dayItem)=>{
                    return `<td></td>`
                  }).join("")
                  return `<tr style="height:${this.timeHeight}px">${hourTd + daysTd}</tr>`
                }).join("")
              }
            </tbody>
          </table>
          <!-- 任务区域 -->
          <div class="Calendar-task-container" style="width:100%; ">
            <div class="Calendar-header-padleft"></div>
            ${
              this._getDays().map(dayItem=>{
                return `<div class="Calendar-task-container-day">
                  ${this.tasks.filter(taskItem=>{
                    return this._getDateKey(taskItem.startDate) === dayItem.key;
                  }).map((task,index)=>{
                    let top = ((task.startDate.getHours() * 60 + task.startDate.getMinutes()) / (24 * 60)) * 24 * this.timeHeight;
                    let height = (
                      (task.endDate.valueOf() - task.startDate.valueOf())/ (60*1000) / (24 * 60)) * 24 * this.timeHeight;
                    const Maxheight =  24 * this.timeHeight - top;
                    console.log(Maxheight,height)
                    height = Math.min(Maxheight, height);
  
                    return `
                    <div class="Calendar-task-item" style="top:${top}px;height:${height}px; data-title="${task.title}">
                      <div class="Calendar-task-item-label ${["orange","blue"][index%2]}"></div>
                      <div class="Calendar-task-item-title">
                        <div class="Calendar-task-item-text">
                        ${task.title}
                        </div>
                      </div>
                    </div>`

                  }).join("")
                }
                </div>`
              }).join("")
            }
          </div>
        </div>
      </div>`
    }

  }
})(this)