function getRegions(inputParams){
    let startDate="";
    let endDate="";
    let params = {
        size:0,
        aggs : {
            regions : {
                terms : { field : 'region',size: 512 }

            }
        }
    };
    if(inputParams){
        startDate=inputParams["start"].getFullYear()+ '-'+ ('0' + (inputParams["start"].getMonth()+1)).slice(-2)+'-'+('0' + inputParams["start"].getDate()).slice(-2);
        endDate=inputParams["end"].getFullYear()+ '-'+ ('0' + (inputParams["end"].getMonth()+1)).slice(-2)+'-'+('0' + inputParams["end"].getDate()).slice(-2);
        params = {

            query:{
            range : {
                first_date : {
                    gte : startDate,
                        lte : endDate
                             }
                    }
                    },
            size:0,
            aggs : {
            regions : {
                terms : { "field" : "region","size": 512 }

            }
        }
        }

    }
    console.log(params);
    let http = new XMLHttpRequest();
    http.withCredentials = true;

    let url = 'http://carlfolio.com:9200/jobs/_search';

    http.open('POST', url, true);

    http.setRequestHeader('Content-type', 'application/json');

    http.onreadystatechange = function() {//Call a function when the state changes.

        console.log(http.status);

        if(http.readyState === 4 && http.status === 401) {

            alert("wtf");

        }
        else if(http.readyState === 4 && http.status === 200){

            let data = JSON.parse(http.response);

            //console.log(data["aggregations"]["regions"]["buckets"]);
            data["aggregations"]["regions"]["buckets"].splice(-1,1);
            setRegions(data["aggregations"]["regions"]["buckets"]);



        }

    };

    http.send(JSON.stringify(params));
}