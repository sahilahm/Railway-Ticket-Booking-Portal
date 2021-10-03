const express = require('express');
const neo4j = require('neo4j-driver');

const app= express();

const driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j","Jatin"));
const session = driver.session();


//----------------------------------------------------------------------------------------------

function getArraysIntersection(a1,a2){
    return  a1.filter(function(n) { return a2.indexOf(n) !== -1;});
}


async function findId(name){
    var ID;
    try{
        const result = await session.run(
            'MATCH(n:city{name:$name}) RETURN n',
            {name:name}
        )
        // console.log(result.records[0]._fields[0].identity.low);
        ID=result.records[0]._fields[0].identity.low;
    }
    catch(err){
        console.log(err);
    }

    return ID;    
}


async function findCode(name){
    var Code;
    try{
        const result = await session.run(
            'MATCH(n:city{name:$name}) RETURN n',
            {name:name}
        )
        // console.log(result.records[0]._fields[0].identity.low);
        Code=result.records[0]._fields[0].properties.code;
    }
    catch(err){
        console.log(err);
    }

    return Code;    
}

async function first_layer(from){
    var code1 = await findCode(from);
    let list1=[];
    try{
        var result= await session.run(
            'MATCH (c1:city{code:$code1}),(c2:city), p=(c1)-[r:train*1]->(c2) return r',
            {code1:code1}
        )
        // result.records.forEach(record=>{
        //     record._fields.forEach(item=>{
        //         item.forEach(i=>{
        //             console.log(i.properties);
        //         })
        //     })
        // });
        for(var i=0;i<result.records.length;i++){
            list1.push(result.records[i]._fields[0][0].properties.trainNO);
            // console.log(result.records[i]._fields[0][0].properties.trainNO);
        }
        
    }
    catch(err){
        console.log(err);
    }

    return list1;    
};


async function second_layer(to){
    var code2 = await findCode(to);
    var list2=[];
    try{
        const result = await session.run(
            'MATCH (c1:city{code:$code2}),(c2:city), p=(c2)-[r:train*1]->(c1) return r',
            {code2:code2}
        )
        for(var i=0;i<result.records.length;i++){
            list2.push(result.records[i]._fields[0][0].properties.trainNO);
            // console.log(result.records[i]._fields[0][0].properties.trainNO);
        }
        
    }
    catch(err){
        console.log(err);
    }

    return list2;
    
};

function check_time(_startTime,_endTime){
    let startTime = Math.floor(_startTime)*60*60*1000 + (Math.round(( (_startTime-Math.floor(_startTime))+ Number.EPSILON) * 100) / 100)*100*60*1000;
	let endTime = Math.floor(_endTime)*60*60*1000 + (Math.round(( (_endTime-Math.floor(_endTime))+ Number.EPSILON) * 100) / 100)*100*60*1000;
    let bufferTime=108000000;
    // console.log((startTime/(1000*60)),(endTime/(1000*60)));
    startTime=(startTime/(1000*60));
    endTime=(endTime/(1000*60));

    if(startTime<endTime){
        return true;
    }
    else{
        return false;
    }
}


async function print_code(from,to,train){
    var trainNO=train;
    var start_id=await findId(from);
    var end_id=await findId(to);
    var preId=start_id;
    var total_distance=0;
    var route=[];
    while(preId!=end_id){
        try{
            const result = await session.run(
                'MATCH (c1),(c2),(c1)-[r:train{trainNO:$trainNO}]->(c2) WHERE ID(c1)=$id return c1,c2,r',
                {id:preId,trainNO:trainNO}
            )
            // console.log(result.records[0]._fields[0].properties.name);
            // console.log(result.records[0]._fields[1].properties.name);
            // console.log(result.records[0]._fields[2].end.low);
            route.push({
                start: result.records[0]._fields[0].properties.name,
                end: result.records[0]._fields[1].properties.name,
                distance: result.records[0]._fields[2].properties.distance
            });
            total_distance+=result.records[0]._fields[2].properties.distance;
            preId=result.records[0]._fields[2].end.low;
        }
        catch(err){
            console.log(err);
        }
    }
    // console.log(trainNO + " " +total_distance);
    route.unshift({
        trainNO:trainNO,
        totalDistance:total_distance
    })
    // console.log(route);
    return route;
}

async function dijkstra(from,to){
    var code1 = await findCode(from);
    var code2 = await findCode(to);
    var list=[];
    try{
        const result = await session.run(
            // 'MATCH (c1:city { name:$city1 }) MATCH (c2:city { name:$city2 }) CALL apoc.algo.dijkstra(c1, c2, "train", "distance") YIELD path, weight RETURN path, weight',
            'MATCH (c1:city { code:$code1 }) MATCH (c2:city { code:$code2}) CALL apoc.algo.dijkstra(c1, c2, "train", "distance") YIELD path, weight RETURN path, weight',
            {code1:code1,code2:code2}
        )
        // console.log(result.records[0]._fields[0].segments[0].relationship.properties.dArrival);
        // console.log(result.records[0]._fields[0].segments[0].relationship.properties.sDeparture);
        for(var i=0;i<result.records.length;i++){
            var x=result.records[i]._fields[0].segments;
            var flag=true;

            for(var j=0;j<x.length-1;j++){
                var time1=x[j].relationship.properties.dArrival;
                var time2=x[j+1].relationship.properties.sDeparture;
                // console.log(time1,time2);
                if(check_time(time1,time2)==false){
                    flag=false;
                    break;
                }
            }
            console.log("\n");
            if(flag==true){
                var path=[];
                for(var k=0;k<x.length;k++){
                    path.push({
                        start: x[k].relationship.start.low,
                        end: x[k].relationship.end.low,
                        distance: x[k].relationship.properties.distance
                    });
                }
                list.push(path);
            }
        }
        // console.log(result.records);
    }
    catch(err){
        console.log(err);
    }

    return list;
}

const main = async(from,to)=>{
    var sortest = await dijkstra(from,to);
    return sortest;
}

const all_route = async(from,to)=>{
    var list1= await first_layer(from);
    var list2 = await second_layer(to);
    // console.log(list1);
    // console.log(list2);
    var list= getArraysIntersection(list1,list2);
    // console.log(list.length);    // console.log(list); && i!=2,7
    
    var all_routes=[];
    for(var i=0;i<list.length;i++){
        var a = await print_code(from,to,list[i]);
        all_routes.push(a);
    }
    // console.log(all_routes);
    return all_routes;
}






//-----------------------------------------------------------------------------------------------
// var list1=[];
// session
//     .run('MATCH (c1:city{code:"NDLS"}),(c2:city), p=(c1)-[r:train*1]->(c2) return r')
//     .then(function(result){
//         for(var i=0;i<result.records.length;i++){
//             list1.push(result.records[i]._fields[0][0].properties.trainNO);
//         }
//         console.log(list1);
//     })
//     .catch(function(err){
//         console.log(err);
//     })

// console.log(list1);


// driver.close();
