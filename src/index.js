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
     * 根据任务冲突，分为不同的group
     * @param {Array} tasks 
     * @param {Boolean} confidence 是否和数组中的任何一项冲突
     */
    _groupTask(tasks, confidence = true) {
      function isConfidence(task, tasks){
        return !!tasks.find(taskItem=>{
          return taskItem.startDate < task.startDate && task.startDate < taskItem.endDate
            || taskItem.startDate < task.endDate && task.endDate < taskItem.endDate
        })
      }

      return tasks.reduce((p,c)=>{
        for(let groupItem of p){
          if(isConfidence(c, groupItem) === confidence){
            groupItem.push(c)
            return p
          }
        }
        // 所有 group 都无法放下 c 时，创建一个新的 group 
        p.push([c]);
        return p;
      }, [])
    }

    /**
     * @description 构造当天所有任务的分组
     * @param {Array} tasks 
     */
    _generageTaskGroups(tasks){
      return this._groupTask(tasks,true).map(groupItem=>this._groupTask(groupItem,false))
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
          <div class="Calendar-table">
              ${
                this._getHours().map((hourText)=>{
                  const hourTd = `<div class="Calendar-hour">${hourText}</div>`
                  const daysTd = `<div class="Calendar-empty"></div>`
                  return `<div class="Calendar-row" style="height:${this.timeHeight}px">${hourTd + daysTd}</div>`
                }).join("")
              }
          </div>
          <!-- 任务区域 -->
          <div class="Calendar-task-container" style="width:100%; height:${24 * this.timeHeight}px">
            <div class="Calendar-header-padleft"></div>
            ${
              this._getDays().map(dayItem=>{
                return `<div class="Calendar-task-container-day">
                  ${this._generageTaskGroups(this.tasks.filter(taskItem=>{
                    return this._getDateKey(taskItem.startDate) === dayItem.key;
                  }).sort((a,b)=>a.startDate - b.startDate).map((task,index)=>{
                    task.index = index%3;
                    return task;
                  })).map(group=>{
                    return `<div class="Calendar-task-group">${
                      group.map(column=>{
                        return `<div class="Calendar-task-column">${
                          column.map((task)=>{
                            let top = ((task.startDate.getHours() * 60 + task.startDate.getMinutes()) / (24 * 60)) * 24 * this.timeHeight;
                            let height = (
                              (task.endDate.valueOf() - task.startDate.valueOf())/ (60*1000) / (24 * 60)) * 24 * this.timeHeight;
                            const Maxheight =  24 * this.timeHeight - top;
                            console.log(Maxheight,height)
                            height = Math.min(Maxheight, height);
                            return `
                            <div class="Calendar-task-item" style="top:${top}px;height:${height}px; data-title="${task.title}">
                              <div class="Calendar-task-item-label ${["orange","blue","green"][task.index]}"></div>
                              <div class="Calendar-task-item-title">
                                <div class="Calendar-task-item-text">
                                  ${task.title}
                                </div>
                              </div>
                            </div>`
                          }).join("")
                        }</div>`
                      }).join("")
                    }</div>`
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