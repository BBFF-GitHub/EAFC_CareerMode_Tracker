using ElectronNET.API;
using Microsoft.AspNetCore;
using System.Diagnostics;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");


//// Run app + launch Electron
//app.Lifetime.ApplicationStarted.Register(() =>
//{
//    // Point to the Electron binary
//    var electronPath = Path.Combine(Directory.GetCurrentDirectory(), "bbff_eafc_career.client", "node_modules", ".bin", "electron");

//    // Path to your Electron main.js
//    var electronMain = Path.Combine(Directory.GetCurrentDirectory(), "bbff_eafc_career.client", "electron", "main.js");

//    // Start Electron, loading http://localhost:5000
//    var psi = new ProcessStartInfo
//    {
//        FileName = electronPath,
//        Arguments = electronMain,
//        UseShellExecute = false,
//        RedirectStandardOutput = true,
//        RedirectStandardError = true
//    };

//    Process.Start(psi);
//});


app.Run();