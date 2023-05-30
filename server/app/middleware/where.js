const Sequelize = require('sequelize');
const Op = Sequelize.Op;
module.exports = (options, app) => {


	async function getNeedsTree(ctx,id){
        let rootNeeds = await ctx.model.Company.findAll({
            where : { 
                id : id 
            },
            raw:true
        })
        rootNeeds = await getChildNeeds(ctx,rootNeeds);
        return rootNeeds;
    }
    async function getChildNeeds(ctx,rootNeeds){
        let expendPromise = [];
        rootNeeds.forEach(item => {
            expendPromise.push(ctx.model.Company.findAll({
                where : {
                    pid : item.id
                },
            	raw:true
            }))
        })
        let children = await Promise.all(expendPromise);
        for(let [idx , item] of children.entries()){
			if (item.length > 0) {
				item=item.filter((a) => {
					return a.id!=a.pid
                })
                item = await getChildNeeds(ctx,item);
            }
            rootNeeds[idx].children = item;
        }
        return rootNeeds;
    }

    function buildTree(data) {
	    const res = [];
	    // 找出所有根结点
	   
	    for (const item of data) {
	        
	        
             getNode(item.children);
    
            res.push(item.id);
	        
	    }
	    // 传入根结点id 递归查找所有子节点
	    function getNode(data) {
	        for (const item of data) {
	        
	            if (data && data.length > 0){
	            	getNode(item.children);
	            }
	            
	    
	            res.push(item.id);
	            
		        
		    }
	      
	    }
	    return res;
	}
    return async function where(ctx, next) {
        if(!app){
        	await next();

        }else{
        	
        
			var params = {};
			console.log("dddddddddddddd",ctx.request.body)
      		if(ctx.request.body && ctx.request.body.filters){
      			params = ctx.request.body;

      		}

        	
        	let where={}

        	if(ctx.user && ctx.user.company_id && (ctx.request.url.indexOf('list')>-1 || ctx.request.url.indexOf('/user/count')>-1 ||  ctx.request.url.indexOf('detail')>-1)){
				if (

					
					 ctx.request.url == '/api/transactionevent/list'
					|| ctx.request.url == '/api/transaction/list'
					|| ctx.request.url == '/api/flow/list'
					//|| ctx.request.url == '/api/alert/list'
					//|| ctx.request.url == '/api/alertrule/list'
					|| ctx.request.url == '/api/sysconfig/list'
					|| ctx.request.url == '/api/operlog/list'
					|| ctx.request.url == '/api/loginlog/list'
					|| ctx.request.url == '/api/permission/list'

					|| ctx.request.url == '/api/rolepermission/list'
					//|| ctx.request.url == '/api/jetty/list'
					|| ctx.request.url == '/api/producttype/list'
					|| ctx.request.url == '/api/terminal/list'
					// || ctx.request.url == '/api/filterOfTimestamps/list'
				) {

				} else {
					var s = await getNeedsTree(ctx, ctx.user.company_id)
					s = buildTree(s)
				
					if (ctx.request.url == '/api/company/list') {
						where.id = { [Op['in']]: s }
					} else {
						where.company_id = { [Op['in']]: s }
					}
                }
        	}

	      	if(params && params.filters){



	      		if(!(params.filters instanceof Array)){
	      			params.filters=[params.filters]
	      		}

	      		params.filters.forEach((filter)=>{
	      			if(filter['groupOp']=='AND'){
	      				filter['rules'].forEach(function(rule){
			      			if(!where[rule.field]){
			      				where[rule.field]={}
			      			}
			      			if(rule.op=="like"){
			      				rule.data="%"+rule.data+"%"
			      			}
			      			if(rule.op=="between"){
			      				if(rule.field == 'time' && typeof rule.data[0] !='number'){
			      					rule.data=[parseInt(new Date(rule.data[0]).getTime()/1000),parseInt(new Date(rule.data[1]).getTime()/1000)]
			      				}
			      				
			      			}
						    
			      			where[rule.field][Op[rule.op]]=rule.data
			      		})
	      			}else if(filter['groupOp']=='OR'){
	      				filter['rules'].forEach(function(rule){
			      			if(!where[Op.or]){
			      				where[Op.or]=[]
			      			}
			      			
			      			var whereor={}
			      			
			      			if(!whereor[rule.field]){
			      				whereor[rule.field]={}
			      			}
			      			if(rule.op=="like"){
			      				rule.data="%"+rule.data+"%"
			      			}

			      			if(rule.op=="between"){
			      				if(rule.field == 'time' && typeof rule.data[0] !='number'){
			      					rule.data=[parseInt(new Date(rule.data[0]).getTime()/1000),parseInt(new Date(rule.data[1]).getTime()/1000)]
			      				}
			      				
			      			}

			      			whereor[rule.field][Op[rule.op]]=rule.data
			      			//console.log("sssssssssssss",whereor)
			      			where[Op.or].push(whereor)
			      		})
	      			}
	      			


	      		})
	      		


	      	}
	      	console.log(where)

	      	if(JSON.stringify(where) != "{}"){
	      		ctx.request.body.where=where
	      	}
	      	
	        await next();
	        
        }
        

        console.log("==where==");
    }
};
