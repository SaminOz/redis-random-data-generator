# redis-random-data-generator

In working for another NPM project I needed to populate a redis instance with a bunch of random data. I found the redis `pipe` command wasn't working so well so I made this script to facilitate the process. 



 Generator.js - quickly add random data to a redis instance.        

 Basic Usage:                                                       

 > `node generator.js <type> <qty> [<key_prefix>]`
                                                                    
 * This will enter `<qty>` of `<type>` entries into the redis instance  
   running at the server and port address set in the config.json    
   file.                                                            

 * If <key_prefix> is set then this will be prepended to the key (uuid)
   separated by a ":" - thanks to Alfonso Montero for this contribution 
 
   `node generator.js hash 100 session`

   `1)...`
   
   `100) "session:ffab3b35-09c3-4fd7-9af1-4d323534065e"`
                                                                    
 * This (config.json) file is automatically generated on running
   npm install redis-random-data-generator and will default to 
   127.0.0.1:6379 change  the settings to suit your setup. If the
   file gets deleted the local default setting will be used.                              
                                                                    
 * There is no provision yet for an array of `<types>` so if you      
   require various entries you will need to run the command several 
   times.                                                           
                                                                    
 * Run npm test to perform tests on the script.                     
                                                                    
 * The script uses generated uuids for keys and random lorum ipsum  
   for values.                                                      
                                                                    
 * Dependancy Graph for generator.js                                
                                                                     
    ├─┬ lorem-ipsum@1.0.3                                           
    │ └─┬ optimist@0.3.7                                            
    │   └── wordwrap@0.0.3                                          
    ├── node-uuid@1.4.7                                             
    └─┬ redis-stream@0.1.0                                          
      └─┬ event-stream@2.1.9                                        
        ├── from@0.1.3                                              
        ├── optimist@0.2.8                                          
        └── through@0.0.4                                           
                                                                    

 Types (others may be added in future versions i.e. geohash):       

 * 'string'  uses SET to add a redis string value                   
 * 'list'    uses LPUSH to add a random number of values to a list  
 * 'set'     uses SADD to add a random number of values to a set    
 * 'sorted'  uses ZADD to add a random number of values and scores  
   to a sorted set.                                                 
 * 'hash'    uses HMSET to add a random number of values to a hash  
