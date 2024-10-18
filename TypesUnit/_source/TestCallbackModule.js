define(['TypesUnit/_source/TestCallbackModule'], function (TestCallbackModule) {
   return {
      firstCallback: function (name, args) {
         args.meta.a = 9;
         delete args.meta.b;
         args.meta.c = 3;
         return args;
      },
      secondCallback: function (name, args) {
         args.meta.push('new');
         return args;
      },
      TestCallbackModule: TestCallbackModule
   };
});
