function getCalendar(k) {

    console.log("kkkkkkkkkkkkkkkkkkkkkkkkkkkkk" + k)
    date1 = new Date();
    let date2 = new Date();
    let date3 = new Date();
    let trigger = 0;
    var temp;
    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    const monthAbre = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ]
    const getDates = (value) => {
        //  console.log("log")
        var date = value;
        const mm = date.getMonth();
        const yy = date.getFullYear();
        const dd = date.getDate();

        if (date === date3 || date === date2) {
            document.getElementsByClassName("dateString")[k].innerHTML = getDateString(mm, dd, yy);
            extractWithDate(mm, dd, yy);
        }

        if (date === date3 || date === date1)
            document.getElementsByClassName("myString")[k].innerHTML = getMYString(mm, yy);

        let count = 0; // count no. of days must be 42 at end of func
        let day = "";

        const weekd = ["sun", "mon", "tue", "wed", "thrus", "fri", "sat"];

        const monthDays = document.getElementsByClassName("days")[k];
        //last date of current month
        //console.log("month" + months[date.getMonth()])
        const lastDateCurrentMonth = new Date(
            date.getFullYear(),
            date.getMonth() + 1,
            0
        ).getDate();
        //last date of prev month
        //console.log("lastdatecurrentmonth" + lastDateCurrentMonth)
        const lastDatePrevMonth = new Date(
            date.getFullYear(),
            date.getMonth(),
            0
        ).getDate();

        //console.log("lastdateprevmonth" + lastDatePrevMonth)


        date.setDate(1); // set date as  1 of current year and month to get day starting day of month
        const firstDayIndex = date.getDay();
        //console.log("firstdayindex" + firstDayIndex + weekd[firstDayIndex]);
        //prev dates
        for (let x = firstDayIndex; x > 0; x--) {
            day += `<div class="select${k} prev${k} align-self-center">${lastDatePrevMonth - x + 1}</div>`
            //console.log(lastDatePrevMonth - x +  1);
            count++;
        }
        //current dates
        for (let i = 1; i <= lastDateCurrentMonth; i++) {

            if (
                i === new Date().getDate() &&
                date.getMonth() === new Date().getMonth() && date.getFullYear() == new Date().getFullYear()
            ) {
                day += `<div class="select${k} today${k} current-date${k} align-self-center" onclick ="clicker(${i},${k})">${i}</div>`;
                count++;
            } else {
                day += `<div class="select${k} current-date${k} align-self-center" onclick ="clicker(${i},${k},this)">${i}</div>`;
                count++;
            }
        }
        if ((new Date(Date.now()).getMonth()) !== date.getMonth()) {
            // selected = lastDateCurrentMonth;
            date2.setMonth (date.getMonth());
             alert(date2.getMonth())
          extractWithDate(date2.getMonth(),30, date2.getFullYear(), k);
        }
        //next dates
        for (let j = 1; count < 42; j++) {
            day += `<div class="select${k} next${k} align-self-center">${j}</div>`;
            monthDays.innerHTML = day;
            count++;
        }


        //console.log(count);
       
        window.clicker = (i, k ,elem) => {
                
            document.getElementsByClassName("dateString")[k].innerHTML = getDateString(date.getMonth(), i, date.getFullYear());
            //console.log("mm" + mm);
            if (document.querySelector(".my-class"+k)) {
                document.querySelector(".my-class"+k).classList.remove("my-class"+k)
            }
            
           elem.classList.add("my-class"+k)
            extractWithDate(mm, i, yy, k);
        };

    };



    document.getElementsByClassName("prev-month")[k].addEventListener("click", () => {
        date1.setMonth(date1.getMonth() - 1);
        //  console.log("date" + date1);
        monthChange(date1);
    });

    document.getElementsByClassName("next-month")[k].addEventListener("click", () => {
        date1.setMonth(date1.getMonth() + 1);
        //  console.log("date" + date1);
        monthChange(date1);
    });

    document.getElementsByClassName("next-year")[k].addEventListener("click", () => {
        date1.setFullYear(date1.getFullYear() + 1);
        yearChange(date1);
    });
    document.getElementsByClassName("prev-year")[k].addEventListener("click", () => {
        date1.setFullYear(date1.getFullYear() - 1);
        yearChange(date1);
    });
    const yearChange = (date1) => {
        //console.log("yearwala" + date1)
        document.getElementsByClassName("myString")[k].innerHTML = getMYString(months[date1.getMonth()], date1.getFullYear());
        getDates(date1);
    }
    const monthChange = (date1) => {
        //console.log("monthwala" + date1)
        document.getElementsByClassName("myString")[k].innerHTML = getMYString(months[date1.getMonth()], date1.getFullYear());
        getDates(date1);
    }
    document.getElementsByClassName("prev-date")[k].addEventListener("click", () => {
        
        getDates(date3);
        if (temp) temp.classList.remove("my-class");
        var selected = date2.getDate() - 2;

        if (selected == -1) {
            date1.setMonth(date1.getMonth() - 1);
            monthChange(date1);
            
        }
        else {  
            var element = document.getElementsByClassName("current-date" + k)[selected];
            temp = element;
            element.classList.add("my-class");
            document.getElementsByClassName("dateString")[k].innerHTML = getDateString(date2.getMonth(), selected + 1, date2.getFullYear());

            date2.setDate(selected + 1);
            extractWithDate(date2.getMonth(), selected + 1, date2.getFullYear(), k);
        }
     });
    document.getElementsByClassName("next-date")[k].addEventListener("click", () => {
        getDates(date3);
        if (temp) temp.classList.remove("my-class");
        var selected = date2.getDate();
        var element = document.getElementsByClassName("current-date" + k)[selected];
        temp = element;
        element.classList.add("my-class");
        document.getElementsByClassName("dateString")[k].innerHTML = getDateString(date2.getMonth(), selected + 1, date2.getFullYear());
        date2.setDate(selected + 1);
        extractWithDate(date2.getMonth(), selected + 1, date2.getFullYear(), k);

    });

    getDates(date3);

    function getMYString(mm, yy) {
        var dateString = monthAbre[mm] + "  " + yy;
        return dateString;
    }

    function getDateString(mm, dd, yy) {
        var dateString = months[mm] + " " + dd + " " + yy;
        return dateString;

    }
}